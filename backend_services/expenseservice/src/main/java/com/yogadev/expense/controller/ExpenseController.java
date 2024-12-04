package com.yogadev.expense.controller;

import com.yogadev.expense.request.ExpenseDTO;
import com.yogadev.expense.service.ExpenseService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExpenseController {

    private final ExpenseService expenseService;

    @Autowired
    public ExpenseController(ExpenseService expenseService){
        this.expenseService = expenseService;
    }

    @GetMapping("/expense/v1")
    public ResponseEntity<List<ExpenseDTO>> getExpensesOfUser(@RequestParam("user_id") @NotNull String userId){
        try{
            List<ExpenseDTO> expenses = expenseService.getExpenses(userId);
            return new ResponseEntity<>(expenses, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
}

// @RequestParam(required=false) String type       => For Query String, present in the URL.
// @PathVariable(name="user-id") String userId     => For Path Variables