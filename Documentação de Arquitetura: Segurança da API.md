# **Documentação de Arquitetura: Segurança da API**

## **1\. Introdução e Filosofia de Segurança**

Este documento fornece uma análise profunda da arquitetura de segurança e autenticação implementada na API do projeto Ohara Imóveis. A filosofia central é a de **defesa em profundidade**, onde múltiplas camadas e mecanismos de segurança trabalham em uníssono para garantir a integridade dos dados, a confidencialidade das sessões e a proteção contra ameaças comuns.

A arquitetura foi desenhada para ser robusta, escalável e, acima de tudo, segura, utilizando padrões modernos da indústria para gerir o ciclo de vida da autenticação do utilizador.

## **2\. O Dilema da Revogação de Tokens: A Decisão Arquitetural Chave**

A base do nosso sistema de autenticação é o uso de **JSON Web Tokens (JWTs)**, especificamente um par de **Access Token** e **Refresh Token**. Esta abordagem oferece uma excelente experiência de utilizador, permitindo sessões de longa duração sem a necessidade de logins frequentes.

No entanto, ela introduz um desafio de segurança fundamental: como invalidar um token (especialmente um refreshToken de longa duração) se ele for comprometido ou se o utilizador simplesmente desejar encerrar a sua sessão (logout)?

Durante o desenvolvimento, foram consideradas duas estratégias profissionais para resolver este problema:

### **2.1. A Opção Considerada: Blocklist com Cache em Redis**

Uma abordagem padrão da indústria é utilizar um cache em memória de alta velocidade, como o **Redis**, para manter uma "blocklist" de tokens invalidados.

* **Como Funcionaria:** Cada token gerado teria um identificador único (jti). Ao fazer logout, este jti seria adicionado ao Redis com um tempo de vida (TTL) igual ao tempo de expiração restante do token. Cada requisição subsequente verificaria primeiro o Redis para garantir que o token não foi revogado.  
* **Vantagens:** Extremamente performático para verificações; permite a invalidação "cirúrgica" de uma única sessão sem afetar outras sessões do mesmo utilizador em outros dispositivos.  
* **Justificativa para a Não Adoção:** Embora poderosa, esta abordagem introduziria uma nova dependência de infraestrutura (o servidor Redis) cujo único propósito, no escopo atual do projeto, seria o de gerir esta blocklist. Avaliou-se que a complexidade adicional de gerir, monitorizar e manter um serviço de cache não se justificava face a uma alternativa mais simples e igualmente segura.

### **2.2. A Opção Escolhida: Versionamento de Tokens (Segurança Robusta com Simplicidade)**

A arquitetura final implementada utiliza uma estratégia de **versionamento de tokens**, que resolve todos os desafios de segurança sem adicionar novas dependências de infraestrutura.

* **Como Funciona:** Cada utilizador na nossa base de dados (PostgreSQL) possui uma coluna tokenVersion (um número inteiro, que começa em 1). Cada token emitido para esse utilizador contém este número de versão no seu payload.  
* **Validação:** As nossas Strategies de segurança (JwtStrategy e JwtRefreshStrategy) têm agora uma responsabilidade crucial: a cada requisição, elas comparam a tokenVersion do token com a tokenVersion atual guardada na base de dados para aquele utilizador. Se não corresponderem, o token é inválido.  
* **A "Troca da Fechadura":** Para invalidar tokens, nós simplesmente incrementamos o valor de tokenVersion na base de dados. Esta única e atómica operação de UPDATE torna, instantaneamente, **todos os tokens emitidos anteriormente** com a versão antiga inúteis.

Esta abordagem foi escolhida por ser:

* **Robusta:** Resolve de forma elegante o problema de "replay attacks" e "race conditions" no processo de refresh.  
* **Simples:** Utiliza apenas a nossa base de dados existente, sem adicionar complexidade à infraestrutura.  
* **Segura:** Garante que operações críticas como logout e refresh resultem na invalidação efetiva dos tokens antigos, tratando cada sessão como um todo coeso. A implicação desta escolha é que um utilizador terá efetivamente uma única "sessão master" de cada vez; uma renovação ou logout num dispositivo invalidará as sessões em todos os outros, o que é um comportamento de segurança desejável e previsível.

## **3\. O Fluxo de Vida de uma Requisição Segura**

Uma requisição à nossa API passa por um funil de segurança antes de ser processada:

1. **Middleware de Borda:** A requisição é primeiro processada por middlewares essenciais definidos no main.ts:  
   * **helmet():** Adiciona cabeçalhos de segurança HTTP para proteger contra vulnerabilidades web.  
   * **cors():** Permite a comunicação segura entre o nosso frontend React e o backend.  
   * **Throttler (Rate Limiting):** A nossa configuração no AppModule e AuthController protege os endpoints de autenticação contra ataques de força bruta, limitando o número de tentativas de login/registo por IP num determinado período.  
2. **Guards e Strategies (A Autenticação e Autorização):** Este é o núcleo da nossa segurança.  
   * A Guard apropriada (LocalAuthGuard, JwtAuthGuard, JwtRefreshGuard) é ativada.  
   * A Guard invoca a sua Strategy correspondente.  
   * A Strategy executa a lógica de validação:  
     * **LocalStrategy:** Valida e-mail e palavra-passe.  
     * **JwtStrategy:** Valida a assinatura, expiração e a tokenVersion do accessToken.  
     * **JwtRefreshStrategy:** Valida a assinatura, expiração e a tokenVersion do refreshToken.  
3. **Validação de Dados (Pipes):** Se a Guard permitir, o ValidationPipe garante que os dados de entrada (DTOs) estão no formato correto.  
4. **Controller e Service:** Apenas uma requisição totalmente validada chega à nossa lógica de negócio.

## **4\. Análise dos Fluxos de Autenticação na Prática**

Com a arquitetura de versionamento, os nossos fluxos de autenticação funcionam da seguinte forma:

* **Cadastro (sign-up):** Um novo utilizador é criado com tokenVersion: 1\. O método login é chamado, gerando um par de tokens com esta versão.  
* **Login (sign-in):** O utilizador é validado. O AuthService busca a sua tokenVersion atual na base de dados e gera um novo par de tokens com essa versão.  
* **Logout (logout):** Esta ação é agora equivalente a um "logout de todos os dispositivos". O AuthService chama o UsersService para **incrementar a tokenVersion** do utilizador. Todas as sessões ativas são invalidadas instantaneamente.  
* **Renovação da Sessão (refresh-token):** Este é o fluxo mais crítico e seguro:  
  1. O cliente envia um refreshToken (ex: com versão: 5).  
  2. A JwtRefreshStrategy valida que a versão: 5 do token corresponde à versão: 5 na base de dados.  
  3. Se for válido, o AuthService.refreshToken é chamado.  
  4. A **primeira ação** do serviço é **incrementar a tokenVersion** na base de dados (passando para 6). Isto invalida imediatamente o token que acabou de ser usado.  
  5. A **segunda ação** é buscar o utilizador novamente para obter a sua nova tokenVersion (6).  
  6. A **terceira ação** é gerar um novo par de tokens, agora com a tokenVersion: 6, e enviá-los ao cliente.

Este ciclo de **invalidar-primeiro-depois-gerar** é o que protege o sistema contra ataques de repetição e garante que cada refreshToken só possa ser usado com sucesso uma única vez.