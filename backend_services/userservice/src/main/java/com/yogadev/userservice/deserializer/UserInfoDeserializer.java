package com.yogadev.userservice.deserializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yogadev.userservice.entities.UserInfoDTO;
import org.apache.kafka.common.serialization.Deserializer;

public class UserInfoDeserializer implements Deserializer<UserInfoDTO> {
    @Override
    public UserInfoDTO deserialize(String s, byte[] bytes) {
        ObjectMapper objectMapper = new ObjectMapper();
        UserInfoDTO user = null;

        try {
            user = objectMapper.readValue(bytes, UserInfoDTO.class);
        } catch (Exception ex){
            System.out.println("Not able to deserializer, Look into the properties of source and target and annotations");
        }

        return user;
    }
}
