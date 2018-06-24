curl -X POST --header "Authorization: key=AAAAstcuFus:APA91bHIXGLrORm0mwXiuN6RsjAXXAKGCsRM3JzoVceE8OCBcuB88lPiuCvwS5UVof_lqUAmFTxYS-qTObKzgc4d42fAVTR7KEFMooyhW9TSONMacpTjET5XbGtBNsJzSQj5RuX-VBdL" \
    --Header "Content-Type: application/json" \
    https://fcm.googleapis.com/fcm/send \
    -d "{\"to\":\"d_DAFo1cvTw:APA91bGyZa5kyUsavEosJIz7Ltjta7wlgPXl7UhmBGn07QH8_zgOleal4XvdUjp9S2bOrpGB5jBfUr6qAHpmGHq_TPHBHiIc3q-SfpyFYGUD5eSshIwu4SlPoGQ_QNC09M_eyZUM2fma\",\"notification\":{\"body\":\"Testing message from server\"}}"