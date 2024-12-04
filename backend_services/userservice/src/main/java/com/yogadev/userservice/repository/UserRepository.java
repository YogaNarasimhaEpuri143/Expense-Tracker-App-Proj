package com.yogadev.userservice.repository;

import com.yogadev.userservice.entities.UserInfo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<UserInfo, String> {

    Optional<UserInfo> findByUserId(String id);

}

// Since using userId as the Primary Key in entity & (By default) -> Id name look inside the CRUDRepository
// Need to implement the above method