package com.yogadev.userservice.consumer;

import com.yogadev.userservice.entities.UserInfoDTO;
import com.yogadev.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceConsumer {

    private final UserService userService;

    @Autowired
    public AuthServiceConsumer(UserService userService){
        this.userService = userService;
    }

    @KafkaListener(topics = "${spring.kafka.topic.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void consume(UserInfoDTO eventData){
        try {
            System.out.println("Hello");

            // TODO: Make it transactional, to handle idempotency and validate email, phoneNumber ...  (can use redis distributed lock)
            // User Level Lock (using userId)
            // Two times event
            // Due to partition replication, partition down and up (Possibility)
            // Here not creating, But In Creation cases, we should acquire the Lock on row in database
            userService.createOrUpdateUser(eventData);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
