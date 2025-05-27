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
   * **`/padroes-adotados`**: Incluirá a especificação das características que devem ser obedecidas ao descrever os requisitos do projeto.

Outras pastas podem ser adicionadas conforme a necessidade e serão documentadas nesta seção. Além disso, tanto `/api`, quanto `/web`, contarão com arquivos `docker-compose.yml` e `Dockerfile` próprios, que serão essenciais para a execução do sistema.

## 3. Tecnologias Utilizadas

A seleção da stack tecnológica para este projeto visa o uso de ferramentas modernas, produtivas e alinhadas com as boas práticas de mercado, proporcionando uma base sólida para o desenvolvimento.

* **Frontend (`/web`):**
    * **HTML/CSS:** Linguagens fundamentais para a estruturação semântica e estilização visual das interfaces web.
    * **ReactJS:** Biblioteca JavaScript declarativa e componentizada para a construção de interfaces de usuário interativas e eficientes.
    * **TypeScript:** Superset do JavaScript que adiciona tipagem estática ao código, promovendo maior robustez, legibilidade e manutenibilidade no desenvolvimento frontend.
    * **Vite:** Ferramenta de build moderna e de alta performance para projetos frontend, oferecendo um servidor de desenvolvimento rápido com Hot Module Replacement (HMR) e otimizações de build para produção.

* **Backend (`/api`):**
    * **NestJS:** Framework Node.js progressivo para a construção de aplicações backend eficientes, escaláveis e robustas, utilizando TypeScript por padrão e promovendo arquiteturas modulares.
    * **TypeScript:** Linguagem principal para o desenvolvimento backend, garantindo consistência com o frontend e aproveitando os benefícios da tipagem estática e recursos modernos do JavaScript.
    * **TypeORM:** Object-Relational Mapper (ORM) para TypeScript e JavaScript, facilitando a interação com o banco de dados através de uma camada de abstração orientada a objetos.
    * **Swagger (OpenAPI via NestJS):** Ferramenta integrada ao NestJS para a geração automática de documentação interativa de APIs RESTful, seguindo a especificação OpenAPI.
    * **PostgreSQL:** Sistema de Gerenciamento de Banco de Dados Relacional (SGBDR) objeto, conhecido por sua confiabilidade, extensibilidade e conformidade com padrões SQL.

* **Testes:**
    * **Jest:** Framework de testes JavaScript amplamente utilizado, escolhido para a implementação de testes unitários tanto no frontend (componentes React e lógica de UI) quanto no backend (serviços, controladores e lógica de negócio no NestJS).

* **Conteinerização:**
    * **Docker:** Plataforma para desenvolvimento, distribuição e execução de aplicações em contêineres. Será utilizada para empacotar a aplicação e suas dependências (Node.js, PostgreSQL, etc.), garantindo consistência entre ambientes e simplificando o processo de deploy.

* **Prototipação e Design:**
    * **Figma:** Ferramenta de design de interface colaborativa baseada em nuvem, utilizada para a criação de wireframes, mockups e protótipos navegáveis de alta fidelidade das telas do sistema.

* **Organização e Gerenciamento de Projeto:**
    * **Trello:** Ferramenta de gerenciamento de projetos visuais (Kanban) empregada para a organização do backlog, acompanhamento de tarefas e sprints.
    * **GitHub:** Plataforma para hospedagem do código-fonte, controle de versão distribuído com Git, gerenciamento de issues para rastreamento de tarefas e bugs, e para a documentação de releases do projeto.

**Nota:** A stack tecnológica aqui descrita representa a escolha inicial para o projeto. Eventuais adições ou substituições de ferramentas ou bibliotecas (por exemplo, para testes de integração, observabilidade, análise estática de código, ou outras necessidades específicas) serão avaliadas e, se incorporadas, devidamente registradas e justificadas nesta seção.

## 4. Etapas do Projeto

O desenvolvimento do projeto está segmentado nas seguintes etapas, cada uma com seus respectivos entregáveis e objetivos:

### Etapa 0 e 1: Concepção, Planejamento e Documentação Inicial

* **Identificação de Requisitos Funcionais (RF):**
    * Elaboração de uma lista detalhada com no mínimo 12 RFs, incluindo identificadores únicos.
    * Especificação de 4 RFs para operações CRUD (Create, Read, Update, Delete) em uma única tabela do banco de dados.
    * Especificação de 4 RFs para operações CRUD envolvendo três ou mais tabelas inter-relacionadas.
    * Documentação da funcionalidade de Login como um RF obrigatório e transversal.
    * Utilização do modelo de documento de requisitos fornecido, com inserção dos RFs na seção apropriada.
* **Identificação de Requisitos Não-Funcionais (RNF):**
    * Descrição de pelo menos 4 RNFs relevantes para o software.
    * Garantia de rastreabilidade entre os RNFs e os protótipos de tela.
* **Prototipação de Interface:**
    * Criação de wireframes ou protótipos de média/alta fidelidade utilizando Figma (ou similar).
    * Desenvolvimento de um protótipo navegável no Figma para validar fluxos de usuário.
    * Criação de um Mapa de Navegação das interfaces.
    * Armazenamento dos artefatos na pasta `/prototipos`.
* **Modelagem de Casos de Uso:**
    * Criação de Diagramas de Casos de Uso utilizando notação UML.
    * Documentação detalhada de 8 cenários de casos de uso (4 para CRUD simples, 4 para CRUD complexo, incluindo Login).
    * Armazenamento dos diagramas (fontes e imagens) e descrições na pasta `/requisitos`.
* **Documentação e Gerenciamento Inicial:**
    * Entrega da primeira versão do Documento de Requisitos consolidado.
    * Criação do backlog do produto no GitHub Issues, utilizando um quadro Kanban (ex: Trello ou GitHub Projects) com colunas como "Pronto para Desenvolver", "Desenvolvendo", etc.
    * Criação de pelo menos 2 sprints iniciais com alocação dos requisitos.
    * Garantia de rastreabilidade entre itens do backlog e os RFs/RNFs (ex: usando IDs no título das issues).
    * Avaliação dos requisitos definidos com base nos critérios de verificação/análise.
    * Documentação da primeira release (baseline) do projeto no GitHub, contendo toda a documentação de requisitos.

### Etapa 2: Design Detalhado e Implementação Inicial

* **Design Detalhado do Software:**
    * Elaboração do Diagrama de Classes do domínio, com atributos, métodos, relacionamentos e multiplicidades.
    * Criação do Diagrama de Pacotes para organizar a arquitetura do sistema.
    * Armazenamento dos diagramas na pasta `/docs`.
* **Design da Comunicação entre Componentes:**
    * Modelagem de Diagramas de Sequência para ilustrar interações chave entre os componentes do sistema.
    * Armazenamento dos diagramas na pasta `/docs`.
* **Definição de Padrões (Git e Codificação):**
    * Estabelecimento e documentação (neste README) de regras para o uso do Git (política de branches, formato de mensagens de commit, etc.).
    * Criação e configuração do arquivo `.gitignore` na raiz do projeto.
    * Definição de pelo menos 6 boas práticas de codificação a serem seguidas (ex: padrão de notação, regras para comentários, princípios SOLID, Clean Code).
* **Implementação do CRUD Básico:**
    * Desenvolvimento de uma funcionalidade CRUD completa que manipule uma (1) tabela do banco de dados.
    * Aplicação das boas práticas de codificação definidas.
    * Realização de commits incrementais e gerenciamento das tarefas no Kanban.
* **Especificação da Infraestrutura de Implantação:**
    * Criação do Diagrama de Implantação UML para visualizar a arquitetura física e a distribuição dos componentes.
    * Armazenamento do diagrama na pasta `/docs`.
* **Documentação da Segunda Release:**
    * Criação da segunda baseline do projeto no GitHub (Tags e Release), com um release note especificando as funcionalidades de design e o CRUD básico implementado. A baseline deve conter toda a documentação de design.
* **Apresentação dos Resultados:**
    * Preparação e realização de apresentação em sala de aula sobre o progresso e artefatos da Etapa 2.

### Etapa 3: Implementação Avançada, Testes e Finalização

* **Aplicação Contínua de Boas Práticas:**
    * Manutenção e aplicação consistente das boas práticas de codificação definidas em todo o desenvolvimento.
* **Implementação de CRUD Complexo:**
    * Desenvolvimento de uma funcionalidade CRUD que envolva operações em três ou mais tabelas inter-relacionadas do banco de dados.
* **Implementação de Testes Unitários:**
    * Criação de testes unitários com Jest para pelo menos 3 operações/métodos críticos no backend e/ou frontend.
    * Configuração e análise do relatório de cobertura de testes.
* **Criação de Casos de Teste de Validação:**
    * Elaboração de pelo menos 3 casos de teste de validação (caixa-preta/funcional) detalhados, baseados nos fluxos dos casos de uso.
    * Cada caso de teste deverá conter: ID, nome da funcionalidade, pré-condições, passos de execução, dados de entrada, saída esperada, saída obtida (com print screen) e status (aprovado/reprovado).
    * Armazenamento dos casos de teste na pasta `/testes`.
* **Implementação de Testes de Validação Automatizados:**
    * Automatização dos casos de testes de validação definidos utilizando uma ferramenta como Selenium (ou similar) para interagir com a interface do sistema.
* **Manutenção das Regras do Git:**
    * Assegurar a conformidade com as regras de uso do Git e atualizar esta seção do README, se necessário.
* **Documentação da Terceira Release:**
    * Criação da terceira baseline do projeto no GitHub (Tags e Release), com um release note especificando as funcionalidades implementadas e toda a documentação de testes.
* **Apresentação Final (se aplicável):**
    * Preparação para a apresentação final do projeto, demonstrando todas as funcionalidades e artefatos produzidos.

## 5. Documentação e Organização do Trabalho

Haverá um esforço contínuo para documentar todas as fases e artefatos do projeto de forma clara e abrangente. A organização das tarefas, o acompanhamento do progresso e a gestão do backlog do produto são realizados através de um quadro no Trello, cujos cartões são rastreáveis aos requisitos e atividades aqui descritas. Os protótipos de tela e fluxos de navegação são desenvolvidos e mantidos no Figma.

## 6. Regras de Uso do Git e Padrões de Codificação

*(Esta seção será detalhada e preenchida durante a Etapa 2 do projeto, conforme as definições da equipe).*

---

Este README será um documento vivo e evoluirá junto com o projeto.
