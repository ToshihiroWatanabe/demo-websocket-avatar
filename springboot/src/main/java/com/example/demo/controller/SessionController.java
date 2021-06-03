package com.example.demo.controller;

import com.example.demo.model.Session;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SessionController {

    @MessageMapping("/session")
    @SendTo("/topic/session")
    public Session SendToMessage(@Payload Session message, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        message.setSessionId(headerAccessor.getSessionId());
        System.out.println(message.getSessionId() + " " + message.getName() + "(" + message.getAvatarX() + ", "
                + message.getAvatarY() + ")");
        return message;
    }
}