package com.yogadev.expense.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yogadev.expense.request.ExpenseDTO;
import org.apache.kafka.common.serialization.Deserializer;

public class ExpenseDeserializer implements Deserializer<ExpenseDTO> {


    @Override
    public ExpenseDTO deserialize(String topic, byte[] data){

        ObjectMapper objectMapper = null;
        ExpenseDTO expense = null;

        try{
            expense = objectMapper.readValue(data, ExpenseDTO.class);
        } catch (Exception e) {
            System.out.println("Exception while deserializing expense data");
        }

        return expense;
    }
}
