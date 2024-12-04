# Expense-Tracker-App-Proj

Expense Tracker HLD :- https://app.eraser.io/workspace/3htrvdVgcCxRISdwrM0e 

AWS Basic Infrastrusture :- https://app.eraser.io/workspace/mA1xNM3jYkJI28sjTifl  (Not Shown Entire, Basic Idea) 

### Technologies Used :- 
Java, SpringBoot, Spring Data JPA, Hibernate, Microservices Architecture, Kafka, Kong API Gateway, Lua Scripts, Docker, AWS, AWS CDK, Cloudformation, ECS, Python LLM

#### This application contain `4 microservices`
1. authservice &nbsp;&nbsp;&nbsp;&nbsp;  :- Responsible for authentication & Tokens Management & Publish User data to userservice
2. userservice &nbsp;&nbsp;&nbsp;&nbsp;  :- Service for User Management
3. expenseervice :- Service for managing/storing the expenses of the user
4. dsservice&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;     :- Extract the data the message and convert into the structured format using LLM (MistralAI), and produce for expenseservice. (Auto storing Expense)

* `Communication` &nbsp;&nbsp;&nbsp; :- Kafka (Asynchronous Communication)

* `API Gateway`  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :- Kong & Lua Scripts as plugins.

* `Authentication` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:- Access (JWT), Refresh Token (Opaque) as Stateless Authentication.

* `Deployment Infra` &nbsp;&nbsp;:- AWS, & AWS CDK (Cloud Development Kit)
