# **Arquitetura de Autenticação e Autorização da API**

## **1\. Filosofia e Estratégia de Segurança**

A arquitetura de segurança desta API foi concebida sob o princípio de **defesa em profundidade**. Este modelo estabelece múltiplas camadas de verificação que uma requisição deve atravessar antes de aceder a qualquer recurso, garantindo que a falha de uma única camada não comprometa o sistema como um todo.

Os objetivos centrais desta arquitetura são:

* **Segurança Robusta:** Mitigar vetores de ataque comuns, como roubo de credenciais, ataques de repetição (*replay attacks*) e escalada de privilégios.  
* **Experiência de Utilizador (UX) Contínua:** Proporcionar sessões seguras e de longa duração, eliminando a necessidade de logins frequentes.  
* **Manutenibilidade e Escalabilidade:** Construir um sistema de segurança modular, cujas regras sejam fáceis de entender, manter e expandir.

Para tal, adotamos um padrão de autenticação baseado em **JSON Web Tokens (JWTs)**, com uma estratégia de **Access Token** e **Refresh Token**, reforçada por um mecanismo de **Versionamento de Tokens** para garantir a invalidação segura das sessões.

## **2\. A Arquitetura de Tokens: Access \+ Refresh**

Para equilibrar segurança e usabilidade, o sistema utiliza dois tipos de tokens:

* **Access Token:** É um token de **curta duração** (ex: 15 minutos). A sua única finalidade é autenticar o utilizador em cada requisição a endpoints protegidos. A sua vida útil limitada reduz drasticamente a janela de oportunidade para um atacante em caso de roubo do token.  
* **Refresh Token:** É um token de **longa duração** (ex: 7 dias), cujo único propósito é ser trocado por um novo par de access e refresh tokens quando o accessToken expirar. Ele só é aceite num único e específico endpoint (POST /auth/refresh-token), minimizando a sua superfície de exposição.

## **3\. O Desafio da Revogação e a Decisão Arquitetural**

A natureza "stateless" (sem estado) dos JWTs apresenta um desafio: como invalidar um token antes da sua data de expiração? Esta funcionalidade é crítica para operações como logout ou para responder a um comprometimento de conta.

Durante o desenvolvimento, a seguinte decisão de arquitetura foi tomada:

#### **Abordagem Escolhida: Versionamento de Tokens vs. Blocklist em Redis**

* **Opção Considerada (Redis):** Uma abordagem comum é usar um cache em memória como o Redis para manter uma "blocklist" de tokens invalidados. Embora seja extremamente performático, foi avaliado que a introdução e manutenção de uma nova dependência de infraestrutura (Redis) apenas para este propósito adicionaria uma complexidade operacional desnecessária para o escopo atual do projeto.  
* **Opção Implementada (Versionamento de Tokens):** A solução adotada foi integrar um mecanismo de versionamento diretamente no nosso banco de dados principal (PostgreSQL).  
  * **Como Funciona:** Cada utilizador na tabela users possui uma coluna tokenVersion (um número inteiro). Cada token emitido para esse utilizador contém este número de versão no seu payload.  
  * **A "Troca da Fechadura":** As nossas Strategies de segurança, a cada requisição, comparam a versão do token com a versão atual na base de dados. Para invalidar todas as sessões de um utilizador, basta **incrementar** este número. Instantaneamente, todos os tokens emitidos com a versão anterior tornam-se inválidos.  
  * **Vantagens:** Esta abordagem resolve os desafios de segurança (incluindo a prevenção de "replay attacks" no refreshToken) de forma atómica e robusta, utilizando a nossa infraestrutura existente e mantendo a arquitetura mais simples e coesa. A implicação é que o logout de um dispositivo invalida a sessão em todos os outros, um comportamento de segurança explícito e desejável para o sistema.

## **4\. O Funil de Segurança: O Ciclo de Vida de uma Requisição**

Toda a requisição que chega à API passa por um funil de validação antes de ser processada.

1. **Middleware de Borda:** A primeira camada de defesa, configurada no main.ts, inclui:  
   * helmet()**:** Ajusta cabeçalhos HTTP para proteção contra vulnerabilidades web.  
   * cors()**:** Gere a política de Cross-Origin Resource Sharing, permitindo a comunicação segura com o frontend.  
   * Throttler **(Rate Limiting):** Protege os endpoints contra ataques de força bruta, limitando a taxa de requisições por IP.  
2. **Guards de Autenticação e Autorização:** O núcleo da nossa lógica de segurança, onde o Passport.js atua. É aqui que decidimos se o utilizador é quem diz ser e se tem permissão para fazer o que está a tentar.  
3. **Pipes de Validação:** O ValidationPipe do NestJS garante que os dados de entrada (DTOs) estão formatados e validados corretamente.  
4. **Controller e Service:** Apenas uma requisição que passou por todas as camadas anteriores chega à lógica de negócio.

## **5\. A Matriz de Autorização: A Orquestra das Guards**

Após a autenticação inicial, a autorização é gerida por um conjunto de Guards que podem ser combinadas para criar regras de acesso granulares.

### **5.1.** LocalAuthGuard **(O Porteiro Principal)**

* **Responsabilidade:** **Autenticação de Credenciais**. Garante que o usuário forneceu uma combinação válida de e-mail e senha.  
* **Mecanismo:** É usada exclusivamente no endpoint de login (/auth/sign-in). Ela ativa a LocalStrategy, que por sua vez chama o AuthService.validateUser() para comparar as credenciais com os dados seguros no banco de dados. Se a validação for bem-sucedida, a requisição prossegue; caso contrário, um erro 401 Unauthorized é retornado.

### **5.2.** JwtAuthGuard **(O Controlo de Passaportes)**

* **Responsabilidade:** **Autenticação de Sessão**. Garante que o utilizador está logado com um accessToken válido.  
* **Mecanismo:** Ativa a JwtStrategy, que valida a assinatura, expiração e, crucialmente, a tokenVersion do accessToken. Se bem-sucedida, anexa os dados do utilizador (user) à requisição. É o pré-requisito para todas as outras Guards de autorização e para o acesso a rotas protegidas.

### **5.3.** JwtRefreshGuard **(A Segurança da Renovação)**

* **Responsabilidade:** **Autenticação para Renovação de Sessão**. Garante que apenas um refreshToken válido pode ser usado para obter novos tokens.  
* **Mecanismo:** Utilizada apenas no endpoint /auth/refresh-token, ela ativa a JwtRefreshStrategy. Esta estratégia realiza a mesma validação robusta do accessToken (assinatura, expiração, tokenVersion), mas utilizando o segredo do refresh token, garantindo que um tipo de token não possa ser usado no lugar do outro.

### **5.4.** RolesGuard **(A Verificação de Cargo)**

* **Responsabilidade:** **Autorização baseada em Papel (Role-Based Access Control \- RBAC)**.  
* **Mecanismo:** Utiliza o decorator @Roles(Role.ADMIN, ...) para definir os papéis permitidos numa rota. A Guard então compara a role do utilizador autenticado (req.user.role) com a lista de papéis permitidos.

### **5.5.** ResourceOwnerGuard **(A Verificação de Propriedade)**

* **Responsabilidade:** **Autorização baseada em Propriedade do Recurso**. Responde à pergunta: "Este recurso que você está a tentar modificar pertence-lhe?".  
* **Mecanismo:** Esta Guard compara o userId do utilizador autenticado (req.user.userId) com o ID do recurso presente nos parâmetros da URL (ex: :id). Ela contém uma regra de exceção que permite o acesso imediato se o utilizador tiver a role de ADMIN.

## **6\. Fluxos de Autenticação na Prática**

Com todos os componentes a trabalhar em conjunto, os principais fluxos de utilizador são:

* **Registo (**sign-up**):** Um novo utilizador é criado com tokenVersion: 1. O AuthService imediatamente gera um par de tokens com esta versão.  
* **Login (**sign-in**):** Um utilizador é validado. O AuthService busca a sua tokenVersion atual e gera um novo par de tokens com essa mesma versão.  
* **Logout (**logout**):** Esta ação é tratada como um "logout de todos os dispositivos". O AuthService **incrementa a** tokenVersion do utilizador, invalidando instantaneamente todos os access e refresh tokens emitidos anteriormente.  
* **Renovação de Sessão (**refresh-token**):** Este é o fluxo mais crítico para a segurança contínua da sessão.  
  1. O cliente envia um refreshToken válido.  
  2. A JwtRefreshStrategy valida a sua assinatura e, crucialmente, que a sua tokenVersion corresponde à versão atual na base de dados.  
  3. Se a validação passar, o AuthService.refreshToken é acionado. A sua **primeira ação** é **incrementar a** tokenVersion do utilizador na base de dados. Isto invalida imediatamente o refreshToken que acabou de ser usado.  
  4. Em seguida, o serviço busca os dados atualizados do utilizador (com a nova versão) e gera um novo par de tokens, que são então retornados ao cliente.

Este ciclo de **invalidar-primeiro-depois-gerar** é a nossa principal defesa contra "replay attacks", garantindo que cada refreshToken só possa ser usado com sucesso uma única vez.