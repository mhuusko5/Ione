var $window = $(window);
$window.ready(function () {
    var $body = $('body');
    var $emptyStyle = $('<style>');
    var $menu = $('#menu');
    var $startScreen = $('#startScreen');
    var $endScreen = $('#endScreen');
    var $endProgressLabel = $('#endProgressLabel');
    var $progressArea = $('#progressArea');
    var $progressLabel = $('#progressLabel');
    var $pauseOverlay = $('#pauseOverlay');
    var $ione = $('#ione');
    var ione = new Ione();
    var leapController = new Leap.Controller({enableGestures: true, frameEventName: 'animationFrame'});

    function pauseGame() {
        if (ione.gameInProgress() && !ione.gamePaused()) {
            ignoreLeapGestures(150);

            ione.pauseGame();
            $pauseOverlay.css('display', 'block');
        }
    }

    function resumeGame() {
        if (ione.gameInProgress() && ione.gamePaused()) {
            ignoreLeapGestures(600);

            ione.resumeGame();
            $pauseOverlay.css('display', 'none');
        }
    }

    function startGame() {
        if (!ione.gameInProgress()) {
            ignoreLeapGestures(600);

            $startScreen.css('display', 'none');
            $endScreen.css('display', 'none');
            $menu.css('display', 'none');

            $progressArea.css('display', 'block');

            ione.startGame();
        }
    }

    function updateGameProgess(currentProgress) {
        $progressLabel[0].innerHTML = 'LEVEL: ' + currentProgress.level + '<br>SCORE: ' + currentProgress.score + '<br>TIME: ' + Math.round(currentProgress.seconds) + 's';
    }

    function showGameEnded(endProgress) {
        ignoreLeapGestures(800);

        $progressArea.css('display', 'none');

        $endProgressLabel.html('LEVEL: ' + endProgress.level + '<br>SCORE: ' + endProgress.score + '<br>TIME: ' + Math.round(endProgress.seconds) + 's');
        $endScreen.css('display', 'block');
        $menu.css('display', 'block');
    }

    ////////////////////////////////////////////////////////////////////////////

    function leapDisconnected() {
        if (ione.gameInProgress() && !ione.gamePaused()) {
            pauseGame();
        }

        alert('Leap Motion Controller disconnected!');
    }

    function leapNotConnected() {
        alert('Please connect your Leap Motion Controller!');
    }

    function returnLeapPosition() {
        var leapFrame = leapController.frame();
        if (leapFrame && leapFrame.valid) {
            var finger;
            if (leapFrame.pointables && (finger = leapFrame.pointables[0]) && finger.valid) {
                var fingerPos = finger.tipPosition;
                var iBox = leapFrame.interactionBox;
                var iBoxLeft = iBox.center[0] - iBox.size[0] / 2;
                var iBoxTop = iBox.center[1] + iBox.size[1] / 2;
                var fingerX = fingerPos[0] - iBoxLeft;
                var fingerY = fingerPos[1] - iBoxTop;
                fingerX /= iBox.size[0];
                fingerY /= iBox.size[1];
                fingerX *= window.innerWidth;
                fingerY *= -window.innerHeight;

                return { x: fingerX, y: fingerY };
            }
        }

        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    var ignoringGestures;
    var gestureIgnoreTimer;

    function ignoreLeapGestures(ms) {
        clearTimeout(gestureIgnoreTimer);
        ignoringGestures = true;
        gestureIgnoreTimer = setTimeout(function () {
            ignoringGestures = false;
        }, ms);
    }

    function checkLeapGestures(leapFrame) {
        if (!nwFocused || ignoringGestures) {
            return;
        }

        var gestures;
        if (leapFrame && leapFrame.valid && (gestures = leapFrame.gestures) && gestures.length > 0) {
            if (ione.gameInProgress()) {
                var tapCount = 0;
                for (var i = 0; i < gestures.length; i++) {
                    if (gestures[i].type == 'screenTap' && gestures[i].state == 'stop') {
                        tapCount++;
                    }
                }
                if (tapCount == 1) {
                    if (ione.gamePaused()) {
                        resumeGame();
                    } else {
                        pauseGame();
                    }
                }
            } else {
                for (var i = 0; i < gestures.length; i++) {
                    if (gestures[i].type == 'circle' && gestures[i].state == 'start') {
                        startGame();
                        break;
                    }
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////

    leapController.on('deviceDisconnected', function () {
        leapDisconnected();
    });

    leapController.on('ready', function () {
        leapController.initialReady = true;
    });

    leapController.connect();

    setTimeout(function () {
        if (!leapController.initialReady) {
            leapNotConnected();
        }
    }, 4000);

    ione.initialize($ione, returnLeapPosition, updateGameProgess, showGameEnded);

    leapController.loop(checkLeapGestures);

    $window.resize(function () {
        $emptyStyle.appendTo($body).remove();
        ione.refreshSizing();
    });

    var nwGui;
    var nwFocused = false;
    if (typeof require != 'undefined' && (nwGui = require('nw.gui'))) {
        var nwWin = nwGui.Window.get();

        nwWin.on('blur', function() {
            pauseGame();

            nwFocused = false;
        });

        nwWin.on('focus', function() {
            nwFocused = true;
        });

        nwWin.show(true);

        nwWin.on('maximize', function () {
            nwWin.focus();

            nwWin.enterFullscreen();
        });

        nwWin.maximize();
    }
});