package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByLocation(String location);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    
    
}
