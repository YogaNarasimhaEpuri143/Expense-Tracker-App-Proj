package org.yogadev.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.yogadev.entities.UserInfo;
import org.yogadev.models.UserInfoDTO;
import org.yogadev.repository.UserRepository;

import java.util.HashSet;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserInfo userInfo = userRepository.findByUserName(username);

        if(userInfo == null){
            throw new UsernameNotFoundException("Could not found the user...!!");
        }
        return new CustomUserDetails(userInfo.getUserName(),userInfo.getPassword(),userInfo.getRoles());
    }

    // Sing-Up Flow
    public UserInfo checkIfUserAlreadyExists(UserInfoDTO userInfoDTO){
        return userRepository.findByUserName(userInfoDTO.getUserName());
    }

    public Boolean signupUser(UserInfoDTO userInfoDTO){

        // Validation on username, password, email

        userInfoDTO.setPassword(passwordEncoder.encode(userInfoDTO.getPassword()));

        // Checking user exists
        if(Objects.nonNull(checkIfUserAlreadyExists(userInfoDTO))){
            return false;
        }

        String userId = UUID.randomUUID().toString();
        userRepository.save(new UserInfo(userId, userInfoDTO.getUserName(), userInfoDTO.getPassword(), new HashSet<>()));

        return true;
    }
}
