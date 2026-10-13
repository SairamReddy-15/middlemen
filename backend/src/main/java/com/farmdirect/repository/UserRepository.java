package com.farmdirect.repository;

import com.farmdirect.model.Role;
import com.farmdirect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleOrderByNameAsc(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
    long countByRole(Role role);
}
