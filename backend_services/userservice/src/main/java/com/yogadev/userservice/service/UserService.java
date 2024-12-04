package com.yogadev.userservice.service;

import com.yogadev.userservice.entities.UserInfo;
import com.yogadev.userservice.entities.UserInfoDTO;
import com.yogadev.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository){ this.userRepository = userRepository; }

    public UserInfoDTO createOrUpdateUser(UserInfoDTO userInfoDTO){

        UnaryOperator<UserInfo> updateUser = (user) -> {
            // TODO: Update Attributes Logic
            UserInfo updatedUser = updateUserInfoAttributes(user);
            return userRepository.save(updatedUser);
        };

        Supplier<UserInfo> createUser = () -> userRepository.save(userInfoDTO.transformToUserInfo());

        UserInfo userInfo = userRepository.findByUserId(userInfoDTO.getUserId())
                .map(updateUser)
                .orElseGet(createUser);

        return createDTOUsingUserInfo(userInfo);
    }

    private UserInfo updateUserInfoAttributes(UserInfo userInfo){
        userInfo.setUserId(userInfo.getUserId());
        userInfo.setFirstName(userInfo.getFirstName());
        userInfo.setLastName(userInfo.getLastName());
        userInfo.setEmail(userInfo.getEmail());
        userInfo.setPhoneNumber(userInfo.getPhoneNumber());

        return userInfo;
    }

    private UserInfoDTO createDTOUsingUserInfo(UserInfo userInfo){
        return UserInfoDTO.builder()
                .firstName(userInfo.getFirstName())
                .lastName(userInfo.getLastName())
                .email(userInfo.getEmail())
                .phoneNumber(userInfo.getPhoneNumber())
                .userId(userInfo.getUserId())
                .build();
    }

    public UserInfoDTO getUser(UserInfoDTO userInfoDto) throws Exception {
        Optional<UserInfo> userInfoOpt = userRepository.findByUserId(userInfoDto.getUserId());

        if (userInfoOpt.isEmpty()) {
            throw new Exception("User not found");
        }
        UserInfo userInfo = userInfoOpt.get();
        return createDTOUsingUserInfo(userInfo);
    }
}
