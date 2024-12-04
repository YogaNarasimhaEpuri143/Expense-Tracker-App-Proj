# Expense-Tracker-App-Proj

Expense Tracker HLD :- https://app.eraser.io/workspace/3htrvdVgcCxRISdwrM0e
AWS Basic Infrastrusture :- https://app.eraser.io/workspace/mA1xNM3jYkJI28sjTifl  (Not Shown Entire, Basic Idea) 

Technologies Used
Java, SpringBoot, Spring Data JPA, Hibernate, Microservices Architecture, Kafka, Kong API Gateway, Lua Scripts, Docker, AWS, AWS CDK, Cloudformation, ECS, Python LLM

This application contain 4 microservices
1. authservice   :- Responsible for authentication & Tokens Management & Publish User data to userservice
2. userservice   :- Service for User Management
3. expenseervice :- Service for managing/storing the expenses of the user
4. dsservice     :- Extract the data the message and convert into the structured format using LLM (MistralAI), and produce for expenseservice. (Auto storing Expense)

Communication :- Kafka (Asynchronous Communication)

API Gateway   :- Kong & Lua Scripts as plugins.

