package com.yogadev.expense.consumer;

import com.yogadev.expense.request.ExpenseDTO;
import com.yogadev.expense.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class ExpenseConsumer {

    private final ExpenseService expenseService;

    @Autowired
    ExpenseConsumer(ExpenseService expenseService){ this.expenseService = expenseService; }

    // Kafka Listener -> Consume and Send data to service layer to store in the database
    @KafkaListener(topics = "${spring.kafka.topic-json.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeExpense(ExpenseDTO expenseDTO){

        try{
            // TODO: Should add Lock
            Boolean expenseCreated = expenseService.createExpense(expenseDTO);
        } catch (Exception ex){
            // Handle the exception here
            System.out.println("Exception in Listening the event");
        }
    }
}

// Update
// fetch from SQL  -->  Business Logic  -->  Save into SQL