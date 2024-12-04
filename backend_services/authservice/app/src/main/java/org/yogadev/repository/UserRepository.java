package org.yogadev.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.yogadev.entities.UserInfo;

@Repository
public interface UserRepository extends CrudRepository<UserInfo, Long> {

    UserInfo findByUserName(String userName);
}
