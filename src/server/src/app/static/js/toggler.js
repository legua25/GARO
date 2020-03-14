function toggler(divId) {
            $("#" + divId).toggle();
            $("#" + divId).removeClass("hidden");     
            document.getElementById("serviciostodos").className = "hidden";
            document.getElementById("impresion").className = "hidden";
        }
        function toggler2(divId) {
            $("#" + divId).toggle();
            $("#" + divId).removeClass("hidden"); 
            document.getElementById("serviciostodos").className = "hidden";
            document.getElementById("construccion").className = "hidden";
        }
        function togglerback(divId) {
            $("#" + divId).toggle();
            $("#" + divId).removeClass("hidden");            
            document.getElementById("impresion").className = "hidden";
            document.getElementById("construccion").className = "hidden";
        }