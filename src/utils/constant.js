/**
 * Created by dharmendra on 31/8/16.
 */
'use strict';
var constants = {};

//Account status
constants.ACCOUNT_STATUS = {
    ACTIVE: 1,
    WAIT_FOR_EMAIL_VALIDATION: 2,
//    WAIT_FOR_ONFIDO_RESPONSE: 3,
    SUSPENDED: 4,
    DELETED: 5,
    ERROR: -1
};

//Registration message status
constants.REG_MESSAGE = {
    PENDING_EMAIL_VERIFICATION: 'Email exists. Please verify your email address.',
    EMAIL_EXITS: 'Email exists. Please go to login page.',
    EMAIL_VERIFICATION: 'Verify link has been sent to your email. Please verify email address to active your account.',
    SUCCESSFUL: "Success",
    PASSWORD_NOT_MATCH: "Invalid password",
    USER_NOT_EXIT: "Email does not exist. please register your email id",
    WAIT_FOR_EMAIL_VALIDATION: 2,
    WAIT_FOR_TOKEN: 3,
    SUSPENDED: 4,
    DELETED: 5,
    DEVICE_REG_SUCCESS: 'Device registered successfully',
    DEVICE_REG_FAILED: 'Device registration failed',
    REG_FAILED: 'Registration failed',
    ACC_SEND_ACTIVATION_AGAIN: '<h2 align="center">Your activation link has expired. We\'ve sent another activation email with link to your registered email id.</h2><br/><h2 align="center"><a href="javascript:window.close()">Close</a></h2>',
    ACC_ACTIVATE: '<h2 align="center">Your Account has been activated. You can now login.</h2><br/><h2 align="center"><a href="javascript:window.close()">Close</a></h2>',
    ACC_ACTIVATE_LOGIN: '<h2 align="center">You can now login.</h2><br/><h2 align="center"><a href="javascript:window.close()">Close</a></h2>',
    ACC_VERIFICATION_FAILED: 'Account verification failed',
    ACC_SUSPENDED: 'You account has suspended. Plase contact us for more info.',
    ACC_DELETED: 'You account does not exist anymore. Please contact us for more info.',
    FRIEND_REG_FAILED: 'Failed to send friend request',
    FRIEND_REG_SUCCESS: 'friend request sent',
    FRIEND_REG_UPDATE: 'Friend request updated',
    FRIEND_FETCH_FAILED: 'Friends fetch failed',
    FRIEND_FETCH_SUCCESS: 'Friends fetch success',
    INVITATION_SEND: 'Invitation have send',
    NOTIFICATION_FETCH_FAILED: 'Failed to fetch notification archive',
    NOTIFICATION_FETCH_SUCCESS: 'Success',
    PROFILE_UPDATED: 'Profile updated',
    CHALLENGE_FETCH_FAILED: 'Challenges fetch failed',
    CHALLENGE_FETCH_SUCCESS: 'Challenges fetch success',
    ACTIVITY_FETCH_SUCCESS: 'Activity fetched successfully',
    FRIEND_ALREADY: 'Already in your friend list',
    FRIEND_TO_YOURSELF: 'You can not send request to yourself'
};

constants.FORGOT = {
    EMAIL_FORGOT_PASSWORD: 'An email with password has been sent'
};

constants.ERROR = {
    UNABLE_TO_FETCH: 'Unable to fetch users',
    UNABLE_TO_EXECUTE: 'Unable to execute',
    LOGIN_FAILED_SERVER: 'Login failed, server error',
    USER_TOKEN_NOT_FOUND: 'Unable to find user token',
    EMAIL_NOT_EXISTS: 'Email does not exist',
    USER_NOT_FOUND: 'User not found',
    UNABLE_TO_UPDATE: 'Unable to update',
    UNABLE_TO_CREATE_DIRECTORY: 'Unable to create directory',
    UNABLE_TO_UPDLOAD_IMAGE: 'Unable to upload image',
    OPERATION_FAILED: 'Operation failed',
    CHALLENGE_CAN_NOT_EDIT_24: 'Use can not edit challenge 24 hour expire.',
    CHALLENGE_CAN_NOT_EDIT: '',
    ACCOUNT_NOT_ACTIVE: 'Your accout is not active.'
};

constants.PLATFORM = {
    ANDROID: 'android',
    IOS: 'ios'
};




constants.NOTIFICATION = {
    TYPE_USER: 'user',
    TYPE_TOPIC: 'topic',
    TYPE_CHAT: 'chat',
    TYPE_WEB: 'web',
    TYPE_PROMO: 'promo',
    TYPE_ALERT: 'alert',
    TYPE_PUSH: 'push',
    TYPE_SMS: 'sms',
    TYPE_INFO: 'info',
    TYPE_FRIEND: 'Friend',
    TYPE_CHALLENGES: 'Challenge',
    TYPE_MARKETING: 'Marketing',
    TYPE_BUSINESS: 'Business',
};

constants.NOTIFICATION_MESSAGE = {
    FRIEND_REQ: 'Got new friend request',
    CHALLENGE_REQ: 'Got new fart challenge request',
    CHALLENGE_REQ_RESPONSE: 'Challenge Response',
    ACCEPT: " %name% have accepted the challenge ! good luck.",
    REJECT: " Oops %name% just rejected the challenge! ",
    QUIT: " %name% have quit the challenge!",
    FART_RESPONSE : "You got new fart"
};


constants.FRIEND_REQ_STATUS = {
    RECEIVED: 1,
    INVITATION_RECEIVED: 2,
    SEND: 3,
    INVITATION_SEND: 4,
    CONFORM: 5,
    DECLINE: -1
};

constants.BATTES_TYPE = {
    SINGLE_FIRE_LABEL: 'Single Fire',
    BEST_OF_THREE_LABEL: 'Best of Three',
    BEST_OF_20_LABEL: 'Best of 10',
    SINGLE_FIRE_COUNT: 1,
    BEST_OF_THREE_COUNT: 3,
    BEST_OF_20_COUNT: 10
};

constants.CHALLENGE_STATUS = {
    NEW: 1,
    RUNNING: 2,
    EXPIRED: 3,
    COMPLETED: 4,
    DELETED: 5
};
module.exports = constants;
