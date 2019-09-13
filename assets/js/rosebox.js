/* *
 * rosebox.js: DEMO SCRIPT utilizing Cube & CubeSet classes.
 *
 * Aug 25th, 2015
 * First implementation with hardcoded values for the demo.
 *
 * By: Jack Dybczak
 * */

/**
 * process_search_results(): callback for cubes after search returns results.
 * @param self - CubeSet object that called in the search request.
 * @param query_text - original query text.
 * @param results - search results.
 * @param param_obj - parameters passed from CubeSet for later processing.
 */
function process_search_results (self, query_text, results, param_obj) {
    if (results.length > 0) {
        //Let's show group rotation buttons as well now.
        if (self.cubes.length == 0)
            $(".btn-info").fadeIn(3000);

        for (var ri = 0; ri < results.length; ri++) {
            var this_cube = self.create_new_cube(null, param_obj.x + (ri * param_obj.space_x), param_obj.y, param_obj.z);

            this_cube.show_backsides(false);    //Solid cube.
            this_cube.set_content("front", '<img src="' + results[ri].url + '" width="100%" height="100%">');
            this_cube.set_content("back", '<img src="' + results[ri].url + '" width="100%" height="100%">');
            this_cube.set_content("left", '<img src="' + results[ri].url + '" width="100%" height="100%">');
            this_cube.set_content("right", '<img src="' + results[ri].url + '" width="100%" height="100%">');
            this_cube.set_content("top", '<h2>' + results[ri].content + '</h2>');
            this_cube.set_content("bottom", '<h2>' + results[ri].title + '</h2>');

            //When this cube is clicked, it will go through its rotations one step at a time.
            this_cube.set_event_handler("click", function (e, self) {
                self.show_next_side();
            });

            //When user hovers mouse above the cube, let's highlight it.
            this_cube.set_event_handler("mouseenter mouseleave", function(e, self) {
                if (e.type == "mouseenter") {   //hover - in.
                    $(self.cube_elem).addClass("selected");
                } else {                        //hover - out.
                    $(self.cube_elem).removeClass("selected");
                }
            });
        }

        //Clean up.
        this_cube = null;
    }
}


$(document).ready(function() {
    var my_cubes = new CubeSet();                                               //Define a new CubeSet.

    //Starting positions for each row (hardcoded for this implementation).
    var cubes_start_x = 0;
    var cubes_start_y = parseInt(window.innerHeight / 2);                       //Middle of the browser window.  We will use it for laying out our rows of cubes.
    var cubes_start_z = -300;
    var cube_margin = 300;                                                      //Spacing in px between cubes.

    //Control movement.
    var controls_move_x_by = 200,
        controls_move_y_by = 200,
        controls_move_z_by = 200;

    //Prevent form submission.
    $("form").on("submit", function(e) {
        e.preventDefault();
        return false;
    });

    //When someone presses ENTER inside the search field...
    $("#search_txt").on("keyup", function(e) {
        e.preventDefault();

        if (e.keyCode == 13) {
            my_cubes.show_results($("#search_txt").val(), {
                space_x: cube_margin,
                x: cubes_start_x,
                y: cubes_start_y,
                z: cubes_start_z
            }, process_search_results);

            cubes_start_z += cube_margin;
        }
        return false;
    });


    //When someone clicks on the search button...
    $("#search_btn").on("click", function(e) {
        my_cubes.show_results($("#search_txt").val(), {
            space_x: cube_margin,
            x: cubes_start_x,
            y: cubes_start_y,
            z: cubes_start_z
        }, process_search_results);
        cubes_start_z += cube_margin;
    });


    //When 'Rotate All' button is clicked...
    $("#rotate_all").on("click", function(e) {
        my_cubes.perform_group_action("show_next_side");
    });


    //When 'Demo' button is clicked...
    $("#demo_all").on("click", function(e) {
        var demo_state = $("#demo_all").attr("data-demo-state");

        switch(demo_state) {
            case "0":
                my_cubes.perform_group_action("demo_start");
                $("#demo_all").text("Stop Demo");
                break;

            case "1":
                my_cubes.perform_group_action("demo_stop");
                $("#demo_all").text("Start Demo");
                break;
        }

        $("#demo_all").attr("data-demo-state", demo_state ^ 1);
    });


    //When cube controls (up / down / left / right) are clicked...
    $("div.cube_controls button").on("click", function(e) {
        var which_control = $(this).attr("data-cube-action");
        var action_params = {};                                     //Define x, y, z parameters to be sent to cubes.

        switch(which_control) {
            case "up":
                action_params.y = -controls_move_y_by;
                break;

            case "down":
                action_params.y = controls_move_y_by;
                break;

            case "left":
                action_params.x = -controls_move_x_by;
                break;

            case "right":
                action_params.x = controls_move_x_by;
                break;

            case "forward":
                action_params.z = controls_move_z_by;
                break;

            case "back":
                action_params.z = -controls_move_z_by;
                break;
        }

        my_cubes.perform_group_action("move_by", action_params);        //Perform the action.
    });
});
