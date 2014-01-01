window.Ione = function () {
    function Point(c, k) {
        this.position = {
            x: c,
            y: k
        };
    }

    Point.prototype.distanceTo = function (c) {
        var k = c.x - this.position.x,
            c = c.y - this.position.y;
        return Math.sqrt(k * k + c * c);
    };

    Point.prototype.clonePosition = function () {
        return {
            x: this.position.x,
            y: this.position.y
        };
    };

    function Region() {
        this.top = this.left = 999999;
        this.bottom = this.right = 0;
    }

    Region.prototype.reset = function () {
        this.top = this.left = 999999;
        this.bottom = this.right = 0;
    };

    Region.prototype.inflate = function (c, k) {
        this.left = Math.min(this.left, c);
        this.top = Math.min(this.top, k);
        this.right = Math.max(this.right, c);
        this.bottom = Math.max(this.bottom, k);
    };

    Region.prototype.expand = function (c, k) {
        this.left -= c;
        this.top -= k;
        this.right += 2 * c;
        this.bottom += 2 * k;
    };

    Region.prototype.contains = function (c, k) {
        return c > this.left && c < this.right && k > this.top && k < this.bottom;
    };

    Region.prototype.size = function () {
        return (this.right - this.left + (this.bottom - this.top)) / 2;
    };

    Region.prototype.center = function () {
        return new Point(this.left + (this.right - this.left) / 2, this.top + (this.bottom - this.top) / 2);
    };

    Region.prototype.toRectangle = function () {
        return {
            x: this.left,
            y: this.top,
            width: this.right - this.left,
            height: this.bottom - this.top
        };
    };

    var c, k, y, v;

    function newGame() {
        false == playerActive && (windowResize(), playerActive = true, u = [], z = [], v = y = k = c = I = gameScore = 0, gameLevel = 1, playerObject.trail = [], playerObject.position.x = 200, playerObject.position.y = 200, playerObject.shield = 0, playerObject.gravity = 0, playerObject.flicker = 0, playerObject.lives = defaultLives, playerObject.timewarped = false, playerObject.timefactor = 0, playerObject.sizewarped = false, playerObject.sizefactor = 0, playerObject.gravitywarped = false, playerObject.gravityfactor = 0, gameTime = (new Date).getTime());
    }

    function playerDied() {
        playerActive = false;
        ra = (new Date).getTime() - gameTime;
        gameScore = Math.round(gameScore);

        endGame({
            level: gameLevel,
            score: gameScore,
            seconds: Math.round(100 * (((new Date).getTime() - gameTime) / 1000)) / 100
        });
    }

    function windowResize() {
        worldRect.width = fixedWorldWidth;

        var actualGameWidth = $game.outerWidth();
        gameScaleAdjustment = actualGameWidth / fixedWorldWidth;
        var actualGameHeight = $game.outerHeight();
        worldRect.height = actualGameHeight / gameScaleAdjustment;

        world.width = worldRect.width * window.devicePixelRatio;
        world.height = worldRect.height * window.devicePixelRatio;
        worldContext.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function L(a, b, g) {
        g = g || 1;
        for (g = 10 * g + Math.random() * 15 * g; 0 <= --g;) {
            var c = new Point;
            c.position.x = a.x + Math.sin(g) * b;
            c.position.y = a.y + Math.cos(g) * b;
            c.velocity = {
                x: -4 + 8 * Math.random(),
                y: -4 + 8 * Math.random()
            };
            c.alpha = 1;
            U.push(c);
        }
    }

    function V(a, b, c, i) {
        W.push({
            x: a,
            y: b,
            width: c,
            height: i
        });
    }

    function C(a, b, c) {
        V(a - c, b - c, 2 * c, 2 * c)
    }

    function processGameFrame() {
        for (var h = W.length; h--;) {
            var t = W[h];
            worldContext.clearRect(Math.floor(t.x), Math.floor(t.y), Math.ceil(t.width), Math.ceil(t.height))
        }
        W = [];
        h = (new Date).getTime();
        ga++;
        h > ha + 1000 && (currentFps = Math.min(Math.round(1000 * ga / (h - ha)), desiredFrameRate), da = Math.min(da, currentFps), ea = Math.max(ea, currentFps), ha = h, ga = 0);
        var g = levelAttributeList[gameLevel - 1],
            l = levelAttributeList[gameLevel],
            h = g.factor,
            t = g.multiplier;
        gameLevel < levelAttributeList.length && playerActive && (h += I / g.duration * (l.factor - g.factor));

        l = 0.01 + 0.99 * (Math.max(Math.min(currentFps, desiredFrameRate), 0) / desiredFrameRate);

        (l = l * l * t) || (l = 0.5);

        var t = baseMovementVector.x * h * (1 - playerObject.timefactor),
            g = baseMovementVector.y * h * (1 - playerObject.timefactor),
            d, j, f;
        j = true == playerObject.flicker % 4 || 2 == playerObject.flicker % 4;

        if (playerActive) {
            var newCursorPos = getCursorPosition();

            if (newCursorPos) {
                cursorPos = newCursorPos;
            }

            var cursorPositionX = cursorPos.x / gameScaleAdjustment;
            var cursorPositionY = cursorPos.y / gameScaleAdjustment;

            var pp = playerObject.clonePosition();
            playerObject.position.x += (cursorPositionX - playerObject.position.x) * positionCatchUpFactor;
            playerObject.position.y += (cursorPositionY - playerObject.position.y) * positionCatchUpFactor;

            gameScore += 0.4 * h * l;
            gameScore += 0.1 * playerObject.distanceTo(pp) * l;
            c++;
            k += 0.4 * h * l;
            y += 0.1 * playerObject.distanceTo(pp) * l;

            playerObject.flicker = Math.max(playerObject.flicker - 1, 0);
            playerObject.shield = Math.max(playerObject.shield - 1, 0);
            playerObject.gravity = Math.max(playerObject.gravity - 0.35, 0);
            playerObject.timewarped ? (0.5999 < playerObject.timefactor && (playerObject.timewarped = false), playerObject.timefactor += 0.1 * (0.6 - playerObject.timefactor)) : playerObject.timefactor += 0.002 * (0 - playerObject.timefactor);
            playerObject.timefactor = Math.max(Math.min(playerObject.timefactor, 1), 0);
            playerObject.sizewarped ? (0.5999 < playerObject.sizefactor && (playerObject.sizewarped = false), playerObject.sizefactor += 0.04 * (0.6 - playerObject.sizefactor)) : playerObject.sizefactor += 0.01 * (0 - playerObject.sizefactor);
            playerObject.sizefactor = Math.max(Math.min(playerObject.sizefactor, 1), 0);
            playerObject.gravitywarped ? (0.99995 < playerObject.gravityfactor && (playerObject.gravitywarped = false), playerObject.gravityfactor += 0.04 * (1 - playerObject.gravityfactor)) : (0.12 > playerObject.gravityfactor && (playerObject.gravityfactor = 0), playerObject.gravityfactor += 0.014 * (0 - playerObject.gravityfactor));
            playerObject.gravityfactor = Math.max(Math.min(playerObject.gravityfactor, 1), 0);

            if (0 < playerObject.shield && (100 < playerObject.shield || 0 != playerObject.shield % 3)) {
                d = playerObject.size * (Math.min(playerObject.shield, 100) / 50);
                worldContext.beginPath();
                worldContext.fillStyle = "#167a66";
                worldContext.strokeStyle = "#00ffcc";
                worldContext.arc(playerObject.position.x, playerObject.position.y, d, 0, 2 * Math.PI, true);
                worldContext.fill();
                worldContext.stroke();
                C(playerObject.position.x, playerObject.position.y, d + 2);
            }

            if (0 < playerObject.gravityfactor > 0) {
                f = playerObject.gravityfactor * baseGravityRate;
                d = worldContext.createRadialGradient(playerObject.position.x, playerObject.position.y, 0, playerObject.position.x, playerObject.position.y, f);
                d.addColorStop(0.1, "rgba(0, 70, 70, 0.8)");
                d.addColorStop(0.8, "rgba(0, 70, 70, 0)");
                worldContext.beginPath();
                worldContext.fillStyle = d;
                worldContext.arc(playerObject.position.x, playerObject.position.y, f, 0, 2 * Math.PI, true);
                worldContext.fill();
                C(playerObject.position.x, playerObject.position.y, f);
            }

            for (; 60 > playerObject.trail.length - 1;) {
                playerObject.trail.push(new Point(playerObject.position.x, playerObject.position.y));
            }

            worldContext.beginPath();
            worldContext.strokeStyle = j ? "333333" : "#648d93";
            worldContext.lineWidth = 2;
            var q = new Region;
            d = 0;

            for (f = playerObject.trail.length; d < f; d++) {
                p = playerObject.trail[d];
                p2 = playerObject.trail[d + 1];
                0 == d ? worldContext.moveTo(p.position.x, p.position.y) : p2 && worldContext.quadraticCurveTo(p.position.x, p.position.y, p.position.x + (p2.position.x - p.position.x) / 2, p.position.y + (p2.position.y - p.position.y) / 2), q.inflate(p.position.x, p.position.y);
                p.position.x += t;
                p.position.y += g;
            }

            q.expand(10, 10);
            d = q.toRectangle();
            V(d.x, d.y, d.width, d.height);
            worldContext.stroke();
            worldContext.closePath();
            f = 0;
            for (d = playerObject.trail.length - 1; 0 < d; d--) {
                p = playerObject.trail[d];
                if (d == Math.round(51) || d == Math.round(45) || d == Math.round(39)) {
                    worldContext.beginPath(), worldContext.lineWidth = 0.5, worldContext.fillStyle = j ? "#333333" : "#8ff1ff", worldContext.arc(p.position.x, p.position.y, 2.5, 0, 2 * Math.PI, true), worldContext.fill(), C(p.position.x, p.position.y, 8), f++;
                }
                if (f == playerObject.lives) {
                    break;
                }
            }
            60 < playerObject.trail.length && playerObject.trail.shift();
            worldContext.beginPath();
            worldContext.fillStyle = j ? "#333333" : "#8ff1ff";
            worldContext.arc(playerObject.position.x, playerObject.position.y, playerObject.size / 2, 0, 2 * Math.PI, true);
            worldContext.fill();
            C(playerObject.position.x, playerObject.position.y, playerObject.size + 6);
        }

        if (playerActive && (0 > playerObject.position.x || playerObject.position.x > worldRect.width || 0 > playerObject.position.y || playerObject.position.y > worldRect.height)) {
            L(playerObject.position, 10), playerDied();
        }

        for (d = 0; d < u.length; d++) {
            p = u[d];
            p.size = p.originalSize * (1 - playerObject.sizefactor);
            p.offset.x *= 0.95;
            p.offset.y *= 0.95;
            j = p.distanceTo(playerObject.position);
            if (playerActive)
                if (0 < playerObject.gravityfactor) q = Math.atan2(p.position.y - playerObject.position.y, p.position.x - playerObject.position.x), f = playerObject.gravityfactor * baseGravityRate, j < f && (p.offset.x += 0.2 * (Math.cos(q) *
                    (f - j) - p.offset.x), p.offset.y += 0.2 * (Math.sin(q) * (f - j) - p.offset.y));
                else if (0 < playerObject.shield && j < 0.5 * (4 * playerObject.size + p.size)) {
                    L(p.position, 10);
                    u.splice(d, 1);
                    d--;
                    gameScore += 20 * l;
                    v += 20 * l;
                    createTrailingPointText(Math.ceil(20 * l), p.clonePosition(), p.force);
                    continue
                } else j < 0.5 * (playerObject.size + p.size) && 0 == playerObject.flicker && (0 < playerObject.lives ? (L(playerObject.position, 4), playerObject.lives--, playerObject.flicker += 60, u.splice(d, 1), d--) : (L(playerObject.position, 10), playerDied()));
            worldContext.beginPath();
            worldContext.fillStyle = "#ff0000";
            worldContext.arc(p.position.x + p.offset.x, p.position.y + p.offset.y, p.size / 2, 0, 2 * Math.PI, true);
            worldContext.fill();
            C(p.position.x + p.offset.x, p.position.y + p.offset.y, p.size);
            p.position.x += t * p.force;
            p.position.y += g * p.force;
            if (p.position.x < -p.size || p.position.y > worldRect.height + p.size) u.splice(d, 1), d--, playerActive && I++
        }
        for (d = 0; d < z.length; d++) {
            p = z[d];
            if (p.distanceTo(playerObject.position) < 0.5 * (playerObject.size + p.size) && playerActive) {
                p.type == shieldString ? playerObject.shield = 300 : p.type == lifeString ? playerObject.lives < maxStoredLives && (createTrailingPointText("LIFE UP!", p.clonePosition(), p.force), playerObject.lives = Math.min(playerObject.lives + 1, maxStoredLives)) : p.type == gravityWarpString ? playerObject.gravitywarped = true : p.type == timewarpString ? playerObject.timewarped = true : p.type == sizewarpString && (playerObject.sizewarped = true);
                p.type != lifeString && (gameScore += 50 * l, v += 50 * l, createTrailingPointText(Math.ceil(50 * l), p.clonePosition(), p.force));
                for (j = 0; j < u.length; j++) e = u[j], 100 > e.distanceTo(p.position) && (L(e.position, 10), u.splice(j, 1), j--, gameScore += 20 * l, v += 20 * l, createTrailingPointText(Math.ceil(20 * l), e.clonePosition(), e.force));
                z.splice(d, 1);
                d--
            } else if (p.position.x < -p.size || p.position.y > worldRect.height + p.size) z.splice(d, 1), d--;
            j = "";
            f = "#000";
            p.type === shieldString ? (j = "S", f = "#007766") : p.type === lifeString ? (j = "1", f = "#009955") :
                p.type === gravityWarpString ? (j = "G", f = "#225599") : p.type === timewarpString ? (j = "T", f = "#665599") : p.type === sizewarpString && (j = "M", f = "#acac00");
            worldContext.beginPath();
            worldContext.fillStyle = f;
            worldContext.arc(p.position.x, p.position.y, p.size / 2, 0, 2 * Math.PI, true);
            worldContext.fill();
            worldContext.save();
            worldContext.font = "bold 12px Arial";
            worldContext.fillStyle = "#ffffff";
            worldContext.fillText(j, p.position.x - 0.5 * worldContext.measureText(j).width, p.position.y + 4);
            worldContext.restore();
            C(p.position.x, p.position.y, p.size);
            p.position.x += t * p.force;
            p.position.y += g * p.force
        }
        u.length < 27 * h && u.push(Ba(new Ca));
        if (1 > z.length && 0.994 < Math.random() && false == playerObject.isBoosted()) {
            for (h = new PowerupObject; h.type == lifeString && playerObject.lives >= maxStoredLives;) h.randomizeType();
            z.push(Ba(h))
        }
        true == playerObject.shield && playerActive;
        for (d = 0; d < U.length; d++) p = U[d], p.velocity.x += 0.04 * (t - p.velocity.x), p.velocity.y += 0.04 * (g - p.velocity.y), p.position.x += p.velocity.x, p.position.y += p.velocity.y, p.alpha -= 0.02, worldContext.fillStyle = "rgba(255,255,255," + Math.max(p.alpha, 0) + ")", worldContext.fillRect(p.position.x, p.position.y, 1, 1), C(p.position.x, p.position.y, 2), 0 >= p.alpha && U.splice(d, 1);
        for (d = 0; d < trailingPointsText.length; d++) p = trailingPointsText[d], p.position.x += t * p.force, p.position.y +=
            g * p.force, p.position.y -= 1, h = worldContext.measureText(p.text).width, l = p.position.x - 0.5 * h, worldContext.save(), worldContext.font = "10px Arial", worldContext.fillStyle = "rgba( 255, 255, 255, " + p.alpha + " )", worldContext.fillText(p.text, l, p.position.y), worldContext.restore(), V(l - 5, p.position.y - 12, h + 8, 22), p.alpha *= 0.96, 0.05 > p.alpha && (trailingPointsText.splice(d, 1), d--);
        n.message && "" !== n.message && (n.progress += 0.05 * (n.target - n.progress), 0.9999999 < n.progress ? n.target = 0 : 0 == n.target && 0.05 > n.progress && (n.message = ""), worldContext.save(), worldContext.font = "bold 22px Arial", p = {
            x: worldRect.width - worldContext.measureText(n.message).width -
                15,
            y: worldRect.height + 40 - 55 * n.progress
        }, worldContext.translate(p.x, p.y), worldContext.fillStyle = "rgba( 0, 0, 0, " + 0.4 * n.progress + " )", worldContext.fillRect(-15, -30, 200, 100), worldContext.fillStyle = "rgba( 255, 255, 255, " + n.progress + " )", worldContext.fillText(n.message, 0, 0), V(p.x - 15, p.y - 30, 200, 100), worldContext.restore());

        if (playerActive) {
            if (h = I > levelAttributeList[gameLevel - 1].duration) {
                gameLevel < levelAttributeList.length ? (gameLevel++, I = 0, h = true) : h = false;
            }

            h && (n.message = "LEVEL " + gameLevel + "!", n.progress = 0, n.target = 1);

            sendProgess({
                level: gameLevel,
                score: Math.round(gameScore),
                seconds: Math.round(100 * (((new Date).getTime() - gameTime) / 1000)) / 100
            });
        }

        gamePaused || (window.requestAnimationFrame || window.webkitRequestAnimationFrame)(processGameFrame);
    }

    function createTrailingPointText(a, b, c) {
        trailingPointsText.push({
            text: a,
            position: {
                x: b.x,
                y: b.y
            },
            alpha: 1,
            force: c
        });
    }

    function Ba(a) {
        0.5 < Math.random() ? (a.position.x = Math.random() * worldRect.width, a.position.y = -20) : (a.position.x = worldRect.width + 20, a.position.y = 0.2 * -worldRect.height + 1.2 * Math.random() * worldRect.height);
        return a;
    }

    function PlayerObject() {
        this.position = {
            x: 0,
            y: 0
        };
        this.trail = [];
        this.size = 8;
        this.shield = 0;
        this.lives = defaultLives;
        this.flicker = 0;
        this.gravitywarped = false;
        this.gravityfactor = 0;
        this.timewarped = false;
        this.timefactor = 0;
        this.sizewarped = false;
        this.sizefactor = 0
    }

    function Ca() {
        this.position = {
            x: 0,
            y: 0
        };
        this.offset = {
            x: 0,
            y: 0
        };
        this.originalSize = this.size = 6 + 4 * Math.random();
        this.force = 1 + 0.4 * Math.random()
    }

    function PowerupObject() {
        this.type = null;
        this.position = {
            x: 0,
            y: 0
        };
        this.size = 20 + 4 * Math.random();
        this.force = 0.8 + 0.4 * Math.random();
        this.randomizeType()
    }

    PlayerObject.prototype = new Point;
    PlayerObject.prototype.isBoosted = function () {
        return 0 != this.shield || 0 != this.gravityfactor
    };
    Ca.prototype = new Point;
    PowerupObject.prototype = new Point;
    PowerupObject.prototype.randomizeType = function () {
        this.type = powerupStrings[Math.round(Math.random() * (powerupStrings.length - 1))];
    };

    var fixedWorldWidth = 1000,
        gameScaleAdjustment = 0,
        desiredFrameRate = 60,
        positionCatchUpFactor = 0.5,
        defaultLives = 2,
        maxStoredLives = 3,
        baseGravityRate = 120,
        shieldString = "shield",
        lifeString = "life",
        gravityWarpString = "gravitywarp",
        timewarpString = "timewarp",
        sizewarpString = "sizewarp",
        powerupStrings = [shieldString, shieldString, lifeString, gravityWarpString, gravityWarpString, timewarpString, sizewarpString],
        worldRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }, $game, world, worldContext, sendProgess, endGame, cursorPos, getCursorPosition = null,
        n = {
            messsage: "",
            progress: 0,
            target: 0
        }, u = [],
        z = [],
        U = [],
        trailingPointsText = [],
        playerObject = null,
        playerActive = false,
        gamePaused = false,
        gameScore = 0,
        gameTime = 0,
        ra = 0,
        I = 0,
        W = [],
        gameLevel = 1,
        levelAttributeList = [
            {
                factor: 1.2,
                duration: 100,
                multiplier: 0.5
            },
            {
                factor: 1.4,
                duration: 200,
                multiplier: 0.6
            },
            {
                factor: 1.6,
                duration: 300,
                multiplier: 0.7
            },
            {
                factor: 1.8,
                duration: 400,
                multiplier: 0.8
            },
            {
                factor: 2,
                duration: 800,
                multiplier: 1
            },
            {
                factor: 2.4,
                duration: 1200,
                multiplier: 1.1
            },
            {
                factor: 2.9,
                duration: 1600,
                multiplier: 1.3
            },
            {
                factor: 3.5,
                duration: 2000,
                multiplier: 1.7
            },
            {
                factor: 4.8,
                duration: 2800,
                multiplier: 2
            },
            {
                factor: 5.6,
                duration: 3600,
                multiplier: 2.3
            },
            {
                factor: 6.6,
                duration: 4400,
                multiplier: 2.8
            }
        ],
        baseMovementVector = {
            x: -1.3,
            y: 1
        };

    v = y = k = c = 0;

    var currentFps = {
            fps: 0,
            fpsMin: 1000,
            fpsMax: 0
        }, da = 1000,
        ea = 0,
        ha = (new Date).getTime(),
        ga = 0;

    this.initialize = function ($canvas, cursorPostionFunction, progressCallback, gameendCallback) {
        $game = $canvas.parent();
        world = $canvas[0];
        worldContext = world.getContext("2d");

        getCursorPosition = cursorPostionFunction;
        sendProgess = progressCallback;
        endGame = gameendCallback;

        playerObject = new PlayerObject();

        windowResize();
        processGameFrame();
    };

    this.refreshSizing = function () {
        windowResize();
    }

    this.startGame = function () {
        newGame();
    }

    this.pauseGame = function () {
        gamePaused = true;
    };

    this.resumeGame = function () {
        gamePaused = false;
        processGameFrame();
    };

    this.gamePaused = function () {
        return gamePaused;
    };

    this.gameInProgress = function () {
        return playerActive;
    };
};