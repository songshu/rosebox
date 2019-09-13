/* *
 * feedminer.js: client-side script for sourcing content for our cubes.
 *
 * Aug 25th, 2015
 * First implementation.
 *
 * By: Jack Dybczak
 * */

/**
 * FeedMiner - demo resource for getting google images.
 * @returns {FeedMiner} - object.
 */
var FeedMiner = (function() {
    //FeedMiner(): constructor.
    /**
     * FeedMiner()
     * @param start_url - our starting url where to get the data.
     * @param result_callback_fn - callback function (after async operation).
     * @constructor
     */
    function FeedMiner(start_url, result_callback_fn) {
        var self = this;

        if (start_url != undefined && result_callback_fn != undefined) {        //If start_url & callback are defined, let's get the content.
            this.url = start_url;
            this.get_content(start_url, {}, function (response) {
                result_callback_fn(self.filter_gimage_search(response));        //Pass results to the requesting object / routine.
            });
        }
    };



    /**
     * get_content(): get content via JSONP.
     * @param this_url - specify URL where to get the data.
     * @param data_params - additional parameters to pass to the ajax call.
     * @param callback_fn - callback function (after async operation).
     */
    FeedMiner.prototype.get_content = function (this_url, data_params, callback_fn) {
        $.ajax({
            url: this_url,
            dataType: "jsonp",
            data: data_params,
            success: callback_fn
        });
    };


    /**
     * filter_gimage_search(): Pass-through function to help us filter out results.
     * For first demo, we will only be supporting google image search.
     * Function simply returns essential result info for demo purpose.
     * @param response - response received from the FeedMiner().
     * @returns {results} - result information from the search.
     */
    //filter_gimage_search(): For first demo, we will only be supporting google image search.
    //Function simply returns essential result info for demo purpose.
    FeedMiner.prototype.filter_gimage_search = function (response) {
        var result_obj = {};

        if (response["responseStatus"] == 200)
            result_obj = response["responseData"]["results"];

        return result_obj;
    };

    return FeedMiner;
})();