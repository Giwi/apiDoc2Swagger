public class KeyAdminVerticle {

    /**
     * @apiDescription Do an upsert
     * @api {POST} /rest/admin/stuff/upsert
     * @apiName upsert
     * @apiParam {Object} stuff org.giwi.Stuff
     * @apiParamExample {json} stuff
     * {
     * "_id" : "",
     * "expirationDate" : 0,
     * "creationDate" : 0,
     * "api" : {
     * "name" : "",
     * "owner" : {
     * "_id" : "",
     * "name" : "",
     * "forname" : "",
     * "email" : "",
     * "token" : "",
     * "tokenRenewDate" : 0
     * },
     * "creationDate" : 0
     * },
     * "value" : "",
     * "srcApp" : "",
     * "env" : "",
     * "owner" : {
     * "_id" : "",
     * "name" : "",
     * "forname" : "",
     * "email" : "",
     * "token" : "",
     * "tokenRenewDate" : 0
     * },
     * "throttling" :0,
     * "actualThrottling" : 0,
     * "lastSeen" :0
     * }
     * @apiHeader {String} x-token-web web token
     * @apiError {Object} org.giwi.CustomException
     * @apiVersion 0.0.1
     * @apiGroup APITest
     * @apiSuccess {Object} stuff org.giwi.Stuff
     */
    public String upsert(String data) {
        // well it's tremendous
        return "Hello " + data;
    }
}
