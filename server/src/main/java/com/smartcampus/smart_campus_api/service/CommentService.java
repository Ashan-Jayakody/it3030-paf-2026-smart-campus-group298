package com.smartcampus.smart_campus_api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcampus.smart_campus_api.model.Comment;
import com.smartcampus.smart_campus_api.repository.CommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByTicket(String ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public Comment updateComment(String commentId, String content, String userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!isAdmin && !comment.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to edit this comment");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!isAdmin && !comment.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
