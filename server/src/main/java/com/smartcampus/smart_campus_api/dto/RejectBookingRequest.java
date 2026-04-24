package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectBookingRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;

    public RejectBookingRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}