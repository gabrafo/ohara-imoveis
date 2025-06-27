# Projeto Ohara Imóveis

## 1. Introdução

Este repositório documenta e armazena os artefatos do projeto Ohara Imóveis, desenvolvido como requisito parcial para a disciplina de Engenharia de Software do curso de Sistemas de Informação da Universidade Federal de Lavras (UFLA). O escopo do projeto envolve a aplicação prática de conceitos e metodologias de engenharia de software, desde a análise de requisitos e design até a implementação, testes e documentação de uma solução de software funcional.

Este arquivo `README.md` serve como o principal ponto de referência do projeto, detalhando sua estrutura organizacional, o conjunto de tecnologias adotadas, o plano de desenvolvimento por etapas, e os padrões e convenções utilizados. Ele será mantido atualizado ao longo do ciclo de vida do projeto.

## 2. Estrutura de Pastas

A organização do projeto foi definida para promover clareza e modularidade, separando as responsabilidades do backend, frontend e documentação geral:

* **`/` (Raiz do Projeto):**
    * `README.md`: Este documento.
    * `.gitignore`: Especifica arquivos e pastas intencionalmente não versionados pelo Git.
    * **`/api`**: Contém todo o código-fonte e configurações do backend da aplicação, desenvolvido em NestJS.
    * **`/web`**: Contém todo o código-fonte e configurações do frontend da aplicação, desenvolvido em ReactJS com Vite.
    * **`/requisitos`**: Armazena toda a documentação referente à engenharia de requisitos, incluindo:
        * Documento de Requisitos (contendo Requisitos Funcionais e Não Funcionais detalhados).
        * Diagramas de Casos de Uso (arquivos fonte UML e suas respectivas imagens).
        * Descrições textuais dos Cenários de Casos de Uso.
    * **`/docs`**: Destinada à documentação de design e arquitetura do software, como:
        * Diagrama de Classes do domínio.
        * Diagrama de Pacotes.
        * Diagramas de Sequência.
        * Diagrama de Implantação.
        * Outros documentos e diagramas relevantes para o entendimento do projeto.
    * **`/prototipos`**: Contém os artefatos da prototipação de interfaces, como:
        * Arquivos de projeto do Figma.
        * Exports de telas e wireframes.
        * Links para protótipos navegáveis.
    * **`/testes`**: Incluirá os planos e evidências dos testes de validação, tais como:
        * Documentos com a especificação dos Casos de Teste de Validação (caixa-preta/funcionais).
        * Scripts de testes automatizados para validação (ex: Selenium).
   * **`/padroes-adotados`**: Incluirá a especificação das características que devem ser obedecidas ao descrever os requisitos do projeto, ou durante partes do fluxo de trabalho.

Outras pastas podem ser adicionadas conforme a necessidade e serão documentadas nesta seção. Além disso, tanto `/api`, quanto `/web`, contarão com arquivos `docker-compose.yml` e `Dockerfile` próprios, que serão essenciais para a execução do sistema.

## 3. Tecnologias Utilizadas

A seleção da stack tecnológica para este projeto visa o uso de ferramentas modernas, produtivas e alinhadas com as boas práticas de mercado, proporcionando uma base sólida para o desenvolvimento.

* **Frontend (`/web`):**
    * **HTML/CSS:** Linguagens fundamentais para a estruturação semântica e estilização visual das interfaces web.
    * **ReactJS (v19.1.0):** Biblioteca JavaScript declarativa e componentizada para a construção de interfaces de usuário interativas e eficientes.
    * **TypeScript (v5.8.3):** Superset do JavaScript que adiciona tipagem estática ao código, promovendo maior robustez, legibilidade e manutenibilidade no desenvolvimento frontend.
    * **Vite (v6.3.5):** Ferramenta de build moderna e de alta performance para projetos frontend, oferecendo um servidor de desenvolvimento rápido com Hot Module Replacement (HMR) e otimizações de build para produção.

* **Backend (`/api`):**
    * **NestJS (v11.1.3):** Framework Node.js progressivo para a construção de aplicações backend eficientes, escaláveis e robustas, utilizando TypeScript por padrão e promovendo arquiteturas modulares.
    * **TypeScript (v5.8.3):** Linguagem principal para o desenvolvimento backend, garantindo consistência com o frontend e aproveitando os benefícios da tipagem estática e recursos modernos do JavaScript.
    * **TypeORM (v0.3.24):** Object-Relational Mapper (ORM) para TypeScript e JavaScript, facilitando a interação com o banco de dados através de uma camada de abstração orientada a objetos.
    * **Swagger (OpenAPI via NestJS) (v11.2.0):** Ferramenta integrada ao NestJS para a geração automática de documentação interativa de APIs RESTful, seguindo a especificação OpenAPI.
    * **PostgreSQL (v15):** Sistema de Gerenciamento de Banco de Dados Relacional (SGBDR) objeto, conhecido por sua confiabilidade, extensibilidade e conformidade com padrões SQL.

* **Testes:**
    * **Jest (v29.5.0):** Framework de testes JavaScript amplamente utilizado, escolhido para a implementação de testes unitários tanto no frontend (componentes React e lógica de UI) quanto no backend (serviços, controladores e lógica de negócio no NestJS).

* **Conteinerização:**
    * **Docker:** Plataforma para desenvolvimento, distribuição e execução de aplicações em contêineres. Será utilizada para empacotar a aplicação e suas dependências (Node.js, PostgreSQL, etc.), garantindo consistência entre ambientes e simplificando o processo de deploy.

* **Prototipação e Design:**
    * **Figma:** Ferramenta de design de interface colaborativa baseada em nuvem, utilizada para a criação de wireframes, mockups e protótipos navegáveis de alta fidelidade das telas do sistema.

* **Organização e Gerenciamento de Projeto:**
    * **GitHub:** Plataforma para hospedagem do código-fonte, controle de versão distribuído com Git, gerenciamento de issues para rastreamento de tarefas e bugs, e para a documentação de releases do projeto.

## 4. Padrões de Commits - Conventional Commits

Para garantir um trabalho colaborativo eficiente e uma documentação clara, adotamos a convenção [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), que define uma estrutura padronizada para as mensagens de commit, facilitando a leitura do histórico, a geração automática de changelogs e o entendimento das mudanças no projeto.

**Formato básico:**
```
<tipo>(escopo opcional): descrição breve da mudança
```

**Tipos mais comuns:**

| Tipo        | Descrição                                                       |
|-------------|-----------------------------------------------------------------|
| `feat`      | Adição de uma nova funcionalidade                              |
| `fix`       | Correção de bug                                                 |
| `docs`      | Alterações na documentação (README, comentários, etc.)         |
| `style`     | Formatação de código (sem alteração de lógica)                 |
| `refactor`  | Refatoração de código (sem adicionar funcionalidade ou corrigir bugs) |
| `test`      | Adição ou alteração de testes                                   |
| `chore`     | Atualizações de tarefas auxiliares (ex: configs, scripts, deps) |
| `ci`        | Alterações nos scripts de integração contínua                  |
| `build`     | Mudanças que afetam o processo de build ou dependências         |
| `revert`    | Reversão de um commit anterior                                 |

**Exemplos de commit:**
```
feat: adiciona formulário de login
fix: corrige validação de e-mail no endpoint de cadastro
docs: atualiza instruções de instalação no README
refactor: reorganiza serviços de autenticação
```


**Nota:** A stack tecnológica aqui descrita representa a escolha inicial para o projeto. Eventuais adições ou substituições de ferramentas ou bibliotecas (por exemplo, para testes de integração, observabilidade, análise estática de código, ou outras necessidades específicas) serão avaliadas e, se incorporadas, devidamente registradas e justificadas nesta seção.
---

Este README será um documento vivo e evoluirá junto com o projeto.
