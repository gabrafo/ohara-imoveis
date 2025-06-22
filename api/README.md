# **API \- Ohara Imóveis**

## **1\. Visão Geral da API**

Esta pasta contém todo o código-fonte, configurações e documentação pertinentes ao backend do projeto Ohara Imóveis. A API foi desenvolvida utilizando o framework **NestJS**, seguindo uma arquitetura modular e orientada a princípios de design de software robustos para garantir escalabilidade, manutenibilidade e segurança.

O propósito desta API é servir como o núcleo de lógica de negócio e persistência de dados para a aplicação, comunicando-se com o frontend (/web) através de uma interface RESTful.

## **2\. Arquitetura e Padrões Adotados**

Para além das tecnologias listadas no README principal do projeto, a arquitetura desta API foi guiada pelas seguintes decisões e padrões:

* **Modularidade (Package by Feature):** A aplicação é organizada em módulos por funcionalidade (ex: AuthModule, UsersModule). Cada módulo encapsula a sua própria lógica de controllers, serviços e entidades, promovendo alta coesão e baixo acoplamento.  
* **Injeção de Dependência:** Utilizamos extensivamente o sistema de injeção de dependência do NestJS para gerenciar o ciclo de vida dos serviços e repositórios, facilitando a testabilidade e a separação de responsabilidades.  
* **Segurança da API:**  
  * Implementação de um sistema de autenticação robusto com **JWT (JSON Web Tokens)**, utilizando um padrão de **Access Token** (curta duração) e **Refresh Token** (longa duração).  
  * A segurança contra ataques de repetição e a invalidação de sessões (logout) são gerenciadas através de um sistema de **versionamento de tokens** (tokenVersion) a nível de usuário, garantindo a revogação imediata de todos os tokens quando necessário.  
  * Proteção contra ataques de força bruta nos endpoints de autenticação, implementada com nestjs-throttler (rate limiting).  
  * Uso do helmet para aplicar cabeçalhos de segurança HTTP em todas as respostas.  
* **Configuração Centralizada:** As configurações da aplicação, incluindo segredos e parâmetros de ambiente, são gerenciadas através do @nestjs/config, lendo variáveis de um ficheiro .env para garantir a portabilidade entre ambientes de desenvolvimento e produção.

## **3\. Variáveis de Ambiente**

Para rodar a aplicação, é necessário criar um ficheiro .env na raiz da pasta /api. Este ficheiro deve conter todas as variáveis de ambiente necessárias para a conexão com a base de dados, configuração dos JWTs e outros serviços.

Crie um ficheiro .env a partir do exemplo abaixo e preencha com os seus valores.

**Exemplo de .env:**

```bash
# Configuração da Aplicação
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Configuração do Banco de Dados (PostgreSQL)
POSTGRES_DB=ohara-imoveis
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
DB_HOST=db
DB_PORT=5432

# Segredos e Expiração dos JWTs
JWT_ACCESS_SECRET=chave_super_secreta_para_access_token_em_desenvolvimento
JWT_ACCESS_EXPIRATION_TIME=15m
JWT_REFRESH_SECRET=chave_muito_secreta_para_refresh_token_em_desenvolvimento
JWT_REFRESH_EXPIRATION_TIME=7d

# Configurações do Rate Limit
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# SonarQube (Opcional)
SONAR_TOKEN=seu_token
```

**Importante:** O ficheiro .env está listado no .gitignore e não deve ser comitado no repositório.

## **4\. Executando o Ambiente de Desenvolvimento**

Para rodar a API localmente, juntamente com o seu banco de dados PostgreSQL, é necessário ter o **Docker** e o **Docker Compose** instalados.

1. **Navegue até a pasta /api** no seu terminal.  
2. Garanta que o seu ficheiro .env está criado e configurado corretamente, conforme a seção anterior.  
3. Execute o seguinte comando:  
   docker compose up \--build

   * O comando up irá iniciar todos os serviços definidos no docker-compose.yml (a aplicação e a base de dados).  
   * A flag \--build força a reconstrução da imagem Docker da sua aplicação, garantindo que quaisquer alterações no código sejam aplicadas.  
4. Após a inicialização, a API estará disponível em http://localhost:8000 (ou na porta que você definiu no seu .env).  
5. A documentação interativa da API (Swagger) estará disponível em http://localhost:8000/docs.

## **5\. Executando a Análise de Qualidade com SonarQube**

O projeto está configurado para análise de código estática com o SonarQube, que roda em seu próprio ambiente Docker.

**Pré-requisitos:**

* Você precisa de um ficheiro docker-compose.sonar.yml configurado para os serviços do SonarQube.  
* Você precisa de ter um ficheiro sonar-project.properties na raiz da pasta /api.  
* Você precisa de um ficheiro .env na raiz da pasta /api contendo a variável SONAR\_TOKEN.

**Fluxo de Execução:**

1. Iniciar o Servidor SonarQube (Terminal 1):  
   Abra um terminal, navegue até a pasta /api e execute o seguinte comando. A flag \-d inicia os contêineres em modo "detached" (em segundo plano).  
   docker compose \-f docker-compose.sonar.yml up \-d

   Aguarde um ou dois minutos para que o serviço seja totalmente inicializado. Você pode aceder à interface web em http://localhost:9000 (login padrão: admin/admin).  
2. **Gerar o Token no SonarQube:**  
   * No primeiro acesso, crie um novo projeto manualmente na interface do SonarQube. A "Project Key" deve ser a mesma que está no seu sonar-project.properties (ex: ohara-imoveis).  
   * Na configuração do projeto, gere um novo token de análise e copie-o.  
   * Cole este token no seu ficheiro .env, na variável SONAR\_TOKEN.  
3. Executar a Análise (Terminal 2):  
   Abra um novo terminal, navegue até a pasta /api e execute o script sonar:  
   npm run sonar

   Este script irá primeiro rodar os testes unitários para gerar um relatório de cobertura e, em seguida, executará o sonar-scanner. O dotenv-cli (configurado no package.json) irá carregar o SONAR\_TOKEN do seu ficheiro .env e passá-lo para o scanner.  
4. **Verificar os Resultados:** Após a conclusão bem-sucedida do comando, atualize a página do seu projeto no SonarQube (http://localhost:9000) para ver o relatório completo da análise de qualidade.