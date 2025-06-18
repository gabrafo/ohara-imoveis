# **Regras de Verificação e Análise de Requisitos**

## **1\. Introdução**

Este documento estabelece as características e regras fundamentais que devem ser obedecidas durante a descrição, verificação e análise dos requisitos do projeto Ohara Imóveis. O objetivo é garantir que os requisitos sejam claros, consistentes, compreensíveis e passíveis de verificação, facilitando o desenvolvimento e a validação do software. As diretrizes aqui apresentadas são baseadas nas boas práticas de Engenharia de Requisitos, conforme discutido no Capítulo 1 do livro "Engenharia de Software Aplicada \- Fundamentos" de Rogério Magela.

## **2\. Nomenclatura dos Requisitos**

Para padronização e fácil identificação, os requisitos do projeto serão classificados e nomeados da seguinte forma:

* **RF (Requisito Funcional):** Descreve uma funcionalidade que o software DEVE realizar. Define o "quê" o sistema fará em termos de tarefas, comportamentos ou interações específicas.  
  * *Exemplo de Identificador:* RF01, RF02, etc.  
* **RNF (Requisito Não Funcional):** Descreve uma restrição ou um critério de qualidade sobre como o software deve executar suas funcionalidades. Define características como desempenho, segurança, usabilidade, confiabilidade, etc.  
  * *Exemplo de Identificador:* RNF01, RNF02, etc.

Cada requisito, seja funcional ou não funcional, deverá possuir um identificador único para fins de rastreabilidade e gerenciamento ao longo do ciclo de vida do projeto.

## **3\. Regras para Especificação de Requisitos**

O documento de requisitos do projeto seguirá, no mínimo, as seguintes regras para a especificação de cada requisito:

### **3.1. Atomicidade: Defina somente um requisito por vez**

Cada sentença de requisito deve expressar uma única ideia ou funcionalidade. Deve-se evitar o uso de conjunções como "E" ou "OU" que combinem múltiplas necessidades em uma única declaração. Isso garante que cada requisito seja individualmente testável e gerenciável.

* **Exemplo CORRETO:**  
  * RF01: O software DEVE permitir o registro dos clientes da empresa.  
  * RF02: O software NÃO DEVE permitir o registro de dois clientes com o mesmo CNPJ.  
* **Exemplo INCORRETO:**  
  * RF03: O software DEVE permitir o registro dos clientes da empresa E não DEVE permitir o registro de dois clientes com o mesmo CNPJ.

### **3.2. Clareza e Precisão: Utilize terminologia consistente e evite ambiguidades**

Os requisitos devem ser escritos de forma clara, concisa e inequívoca, possuindo apenas uma interpretação possível. Para isso:

* **Terminologia Consistente:** Será feito um esforço para convencionar e utilizar os mesmos termos para descrever os mesmos conceitos em todo o projeto. Evitar-se-á o uso de sinônimos ou palavras diferentes para a mesma entidade ou ação, visando a uniformidade e clareza na comunicação dos requisitos.  
* **Evitar Ambiguidade:** Deve-se evitar o uso de palavras vagas, subjetivas ou que possam levar a múltiplas interpretações (ex: "geralmente", "frequentemente", "amigável", "flexível", "aproximadamente"). Frases devem ser diretas e objetivas.  
* **Exemplo de Terminologia Consistente (CORRETO, assumindo "Cliente" como termo convencionado):**  
  * RF04: O software DEVE permitir o registro dos Clientes da empresa.  
* **Exemplo de Terminologia Inconsistente (INCORRETO, usando "Financiador" quando "Cliente" é o termo padrão):**  
  * RF05: O software DEVE permitir o registro dos Financiadores da empresa.  
* **Exemplo de Ambiguidade (INCORRETO):**  
  * RNF01: O sistema DEVE ser rápido.  
* **Exemplo Sem Ambiguidade (MELHOR):**  
  * RNF02: O tempo de resposta para a consulta de saldo do cliente DEVE ser inferior a 2 segundos em 95% das requisições sob carga normal.

### **3.3. Verificabilidade: Cada requisito deve ser verificável**

Todo requisito especificado deve ser passível de verificação ou teste de forma objetiva e com custo possível. Deve ser possível determinar, através de inspeção, análise, demonstração ou teste, se o software atende ou não ao requisito. Requisitos que utilizam termos subjetivos devem ser quantificados ou definidos de forma que sua conformidade possa ser atestada.

* **Exemplo NÃO VERIFICÁVEL (subjetivo):**  
  * RNF03: O website DEVE ser intuitivo para o usuário.  
* **Exemplo VERIFICÁVEL (objetivo e específico):**  
  * RNF04: O tempo de carregamento da página inicial de listagem de imóveis DEVE ser no máximo 3 segundos.  
  * RF05: O sistema DEVE permitir ao usuário filtrar imóveis por tipo (casa, apartamento).

## **4\. Análise e Revisão de Requisitos**

Os requisitos especificados serão submetidos a um processo de análise e revisão para garantir que atendem a estas regras e outras características de qualidade (como completude, consistência, rastreabilidade). Esta análise buscará identificar e corrigir omissões, inconsistências e ambiguidades antes do início do desenvolvimento.
