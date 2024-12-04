package com.yogadev.expense.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yogadev.expense.entities.Expense;
import com.yogadev.expense.repository.ExpenseRepository;
import com.yogadev.expense.request.ExpenseDTO;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ExpenseService {

        private final ExpenseRepository expenseRepository;
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Autowired
        public ExpenseService(ExpenseRepository expenseRepository){
            this.expenseRepository = expenseRepository;
        }

        public boolean createExpense(ExpenseDTO expenseDTO){
            setCurrency(expenseDTO);
            try{
                expenseRepository.save(objectMapper.convertValue(expenseDTO, Expense.class));
                return true;
            } catch (Exception e) {
                System.out.println("Exception Occurred when saving the expense");
                return false;
            }
        }

        public boolean updateExpense(ExpenseDTO expenseDTO){
            // TODO: Should add Lock
            // TODO: Distributed Lock

            // First check whether expense present (or) not.
            // If not false (or) true

            Optional<Expense> expenseFound = expenseRepository.findByUserIdAndExternalId(expenseDTO.getUserId(), expenseDTO.getExternalId());
            if (expenseFound.isEmpty()){
                return false;
            }

            Expense expense = expenseFound.get();
            expense.setCurrency(Strings.isNotBlank(expenseDTO.getCurrency()) ? expenseDTO.getCurrency() : expense.getCurrency());
            expense.setAmount(expenseDTO.getAmount());
            expense.setMerchant(Strings.isNotBlank(expenseDTO.getMerchant()) ? expenseDTO.getMerchant() : expense.getMerchant());

            expenseRepository.save(expense);

            return true;
        }

        public List<ExpenseDTO> getExpenses(String userId){
            // Throws Exception
            List<Expense> expenses = expenseRepository.findByUserId(userId);
            return objectMapper.convertValue(expenses, new TypeReference<List<ExpenseDTO>>() {});
        }

        private void setCurrency(ExpenseDTO expenseDTO){
            if (Objects.isNull(expenseDTO.getCurrency())){
                expenseDTO.setCurrency("inr");
            }
        }

}
