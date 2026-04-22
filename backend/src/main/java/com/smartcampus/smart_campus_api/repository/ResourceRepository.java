package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByTypeIgnoreCase(String type);

    List<Resource> findByLocationIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByTypeIgnoreCaseAndLocationIgnoreCase(String type, String location);
}