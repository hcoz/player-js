/**
 * @param selector: id of the selector of the intended video player
 */
function FramePlayer (selector){
    var self = this;
    self.elements = document.getElementById(selector);
    self.frameWidth = 128;
    self.frameHeight= 72;
    self.progressBarHeight = 20;
    self.elements.innerHTML += '<div class="video"></div><canvas width="' + self.frameWidth + '" height="' + self.progressBarHeight + '" class="progressbar"></canvas>';
    self.progressBarPastColor = '#A8FF51';
    self.progressBarFutureColor = '#C2C3C4';
    self.sourceCount = 7;
    self.sourceId = 0;
    self.framePerSource = 25;
    self.frameCount = self.sourceCount * self.framePerSource; // default value
    self.sourceTemplate = 'http://mcp-media.s3.amazonaws.com/pvw/E05/8B4/E058B455C5B04E7B8ACE8F5176A2E8AB_pvw-M{id}.jpg';
    self.frameRate = 10; // the unit is fps
    self.clockId = -1;
    self.initialFrame = 0;
    self.direction = 1;
    self.running = false;
    self.videoElement = self.elements.querySelector('.video');
    self.progressBarElement = self.elements.querySelector('.progressbar');
    self.videoElement.style.width = self.frameWidth + 'px';
    self.videoElement.style.height = self.frameHeight + 'px';
    self.progressBarElement.style.width = self.frameWidth + 'px';
    self.progressBarElement.style.height = self.progressBarHeight + 'px';

    for (var i = 0 ; i < self.sourceCount ; i ++){
        var image = new Image();
        image.src = self.sourceTemplate.replace('{id}', i);
    }

    self.playSingleFrame = function (){
        self.renderState();
        if (self.direction > 0){
            self.initialFrame++;
        } 
        else {
            self.initialFrame--;
        }
        self.initialFrame %= self.frameCount;
        if (self.initialFrame < 0){
            self.initialFrame += self.frameCount;
        }
    };

    self.renderState = function (){
        dimension = Math.sqrt(self.framePerSource);
        var imageId =  Math.floor(self.initialFrame / self.framePerSource);
        var imageUrl = self.sourceTemplate.replace('{id}', imageId);
        self.videoElement.style.backgroundImage = 'url("' + imageUrl+ '")';
        self.videoElement.style.backgroundPosition = self.frameWidth * ((self.initialFrame % self.framePerSource) % dimension) + 'px '
            + self.frameHeight * (Math.floor((self.initialFrame % self.framePerSource) / dimension )) +'px';
        ctx = self.progressBarElement.getContext('2d');
        ctx.fillStyle = self.progressBarFutureColor;
        ctx.fillRect(0, 0, self.frameWidth, self.progressBarHeight);
        ctx.fillStyle = self.progressBarPastColor;
        ctx.fillRect(0, 0, Math.floor(self.frameWidth * (self.initialFrame + 1) / (self.frameCount)), self.progressBarHeight);
    };
    
    /**
     * @param fps: positive number
     */
    self.setFrameRate = function (fps){
        if (fps){
            if (typeof fps  !== 'number'){
                throw 'non-number frame rate!';
            }
            if (fps <= 0){
                throw 'non-positive frame rate!';
            }
            self.frameRate = fps;
        }
    };

    /**
     * @param fps: positive number
     */
    self.play = function (fps){
        self.pause();
        self.direction = 1;
        self.running = true;
        self.setFrameRate(fps);
        self.clockId = window.setInterval(function (){
                if (!self.running) { return; }
                self.playSingleFrame();
            }, 1000 / self.frameRate);
        self.playSingleFrame();
    };

    self.pause = function (){
        if(self.clockId != -1) {
            window.clearInterval(self.clockId);
        }
        self.running = false;
    };

    /**
     * @param fps: positive number
     */
    self.playBackwards = function (fps){
        self.pause();
        self.direction = -1;
        self.running = true;
        self.setFrameRate(fps);
        self.clockId = window.setInterval(function (){
                if (!self.running) { return; }
                self.playSingleFrame();
            }, 1000 / self.frameRate);
        self.playSingleFrame();
    };

    /**
     * @param frame: number of the seeked frame 
     */
    self.seek = function (frame){
        if (frame < 0 || frame > self.frameCount){
            throw 'invalid frame number to seek';
        }
        self.initialFrame = frame;
        self.renderState();
    };

    self.toggle = function (){
        if (self.running){
            self.pause();
        }
        else {
            if (self.direction > 0){
                self.play(self.frameRate);    
            }
            else {
                self.playBackwards(self.frameRate);
            }
        }
    };

    self.videoElement.addEventListener('click', function (e){
        self.toggle();
        e.preventDefault();
    });

    // click on progress bar 
    self.progressBarElement.addEventListener('click', function (e){
        self.pause();
        self.seek(Math.floor((e.offsetX * self.frameCount) / self.frameWidth));
        self.renderState();
    });

    self.renderState();

}