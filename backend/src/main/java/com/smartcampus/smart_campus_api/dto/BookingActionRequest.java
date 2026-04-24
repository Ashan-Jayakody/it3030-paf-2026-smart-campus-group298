package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotBlank;

public class BookingActionRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

    public BookingActionRequest() {
    }

    public BookingActionRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}