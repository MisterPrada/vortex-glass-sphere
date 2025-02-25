/* Author: https://github.com/MisterPrada */
import * as MathHelper from '@experience/Utils/MathHelper.js'

class Star {
    ctx = window.preloader.ctx;
    preloader = window.preloader
    id = 0;

    params = {
        maxDistFromCursor: 50,
        dotsSpeed: 0,
        backgroundSpeed: 0
    };

    constructor( id, x, y ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.r = Math.floor( Math.random() * 2 ) + 1;
        const alpha = ( Math.floor( Math.random() * 10 ) + 1 ) / 10 / 2;
        this.color = "rgba(255,255,255," + alpha + ")";
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = this.r * 2;
        this.ctx.beginPath();
        this.ctx.arc( this.x, this.y, this.r, 0, 2 * Math.PI, false );
        this.ctx.closePath();
        this.ctx.fill();
    }

    move() {
        this.y -= this.preloader.deltaTime * 15 + this.params.backgroundSpeed / 100;
        if ( this.y <= -10 ) this.y = this.preloader.ch + 10;

        this.draw();
    }

}

class Preloader {
    preloader = document.getElementById( 'preloader' );

    ctx = this.preloader.getContext( '2d' );
    cw = this.preloader.width;
    ch = this.preloader.height;

    size = 20;
    centerX = this.preloader.width / 2;
    centerY = this.preloader.height / 2;
    strokeWidth = 4;
    angle = 0;
    nextTime = 0;
    delay = 1000 / 60 * 0.5;
    deltaTime = 0.016666666666666668;
    current = Date.now();
    start = this.current;
    elapsed = 0;
    animationShow = true;
    activePreloader = true;
    animationState = 0;
    animationInterval = undefined;
    triangleState = 0;
    triangleStateNormalize = 0;
    resizeAction = false;
    aspectRatio = 1 / window.innerHeight

    playButtonAngle = 0
    playButtonState = 0

    stars = []
    initStarsPopulation = 100
    dots = []

    constructor() {
        window.preloader = this

        this.init()

        this.initStars()

        window.requestAnimationFrame( this.animate );
    }

    init() {
        this.resize()

        window.addEventListener( 'resize', () => {
            this.resize()
            this.initStars()
            this.resizeAction = true
        })
    }

    animate = ( time ) => {
        if ( !this.activePreloader ) {
            requestAnimationFrame( this.animate );
            return
        }

        const currentTime = Date.now()
        this.deltaTime = Math.min( ( currentTime - this.current ) * 0.001, 0.016 )
        this.current = currentTime
        this.elapsed = ( this.current - this.start ) * 0.001

        if ( this.deltaTime > 0.06 ) {
            this.deltaTime = 0.06
        }

        if ( time < this.nextTime && !this.resizeAction ) {
            requestAnimationFrame( this.animate );
            return;
        }
        this.resizeAction = false;
        this.nextTime = time + this.delay * this.deltaTime;

        this.ctx.clearRect( 0, 0, this.cw, this.ch );

        this.ctx.fillStyle = 'black';
        this.ctx.globalCompositeOperation = 'xor';
        this.ctx.fillRect( 0, 0, this.cw, this.ch );

        this.ctx.fillStyle = 'black';
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillRect( 0, 0, this.cw, this.ch );

        // Создаем линейный градиент
        const gradient = this.ctx.createLinearGradient( 0, 0, 0, this.ch );

        // Добавляем цвета
        gradient.addColorStop( 0, '#000000' ); // Черный цвет на начале
        gradient.addColorStop( 1, '#5788fe' ); // Синий цвет на конце

        // // Применяем градиент к заливке
        // this.ctx.fillStyle = gradient;
        //
        // // Рисуем прямоугольник, заполняя весь холст
        // this.ctx.fillRect( 0, 0, this.cw, this.ch );


        this.drawStars();

        this.drawTriangle()

        this.triangleState += 3 * this.deltaTime;

        if ( this.triangleState > 4.0 ) {
            this.triangleState = 0;
        }

        this.triangleStateNormalize = this.triangleState / 1.7;

        //this.angle += 60 * this.deltaTime;

        requestAnimationFrame( this.animate );
    }

    drawTriangle() {
        //this.ctx.clearRect( 0, 0, this.cw, this.ch );
        //this.ctx.globalAlpha = 1.0 - this.animationState

        this.ctx.save();

        //const sideLength = this.ch / 3 * this.remap(this.animationState, 0, 1, 1, 0.4); // Length of the side of the big triangle
        const sideLength = (this.ch / 3) / (1 + this.playButtonState * 2);
        const height = sideLength * Math.sqrt( 3 ) / 2 + 1; // Height of the big triangle
        const centroidY = height / 6; // Y-coordinate of the centroid of the big triangle


        // Offset for the center of mass
        this.ctx.translate( this.cw / 2, this.ch / 2 );
        this.ctx.rotate( this.angle * Math.PI / 180 ); // Rotation of the big triangle

        // Rotation animation for play button
        this.ctx.rotate( this.playButtonAngle )


        const smallTriangleCount = 9; // Count of small triangles
        const smallSideLength = sideLength / smallTriangleCount; // Length of the side of the small triangle
        const smallHeight = smallSideLength * Math.sqrt( 3 ) / 2; // Height of the small triangle
        const smallCentroidY = smallHeight / 6; // Y-coordinate of the centroid of the small triangle

        // first minX from smallTriangleCount = 1
        const firstSmallHeight = sideLength * Math.sqrt( 3 ) / 2;
        const firstMinX = Math.abs(-sideLength / 2 + Math.abs( ( -height / 2 + firstSmallHeight / 2 + height / 2 ) / Math.sqrt( 3 ) ));


        // Draw small triangles
        for ( let y = -height / 2 + smallHeight / 2; y <= height / 2 - smallHeight / 2; y += smallHeight ) {
            const minX = -sideLength / 2 + Math.abs( ( y + height / 2 ) / Math.sqrt( 3 ) );
            const maxX = sideLength / 2 - Math.abs( ( y + height / 2 ) / Math.sqrt( 3 ) ) + 1;

            let offsetWhite = 0.2;
            let offsetBlack = 0;

            let distanceToCenter = Math.abs( y );
            offsetWhite = 2 * distanceToCenter / ( sideLength / 2 );
            offsetBlack = 1 * distanceToCenter / ( sideLength / 2 );

            for ( let x = minX; x <= maxX - smallSideLength / 2; x += smallSideLength ) {
                const offsetX = firstMinX / smallTriangleCount;
                const offsetY = firstMinX / 2 + 6;

                this.drawSmallTriangle( x + offsetX, y + offsetY, smallSideLength,'white', false, offsetWhite ); // Small triangles
                this.drawSmallTriangle( x + offsetX, y + offsetY, smallSideLength,`black`, false, offsetBlack ); // Small triangles

                if ( x + smallSideLength / 2 <= maxX - smallSideLength ) {
                    this.drawSmallTriangle( x + offsetX + smallSideLength / 2, y + offsetY, smallSideLength, 'white', true, offsetWhite ); // Reverse small triangles
                    this.drawSmallTriangle( x + offsetX + smallSideLength / 2, y + offsetY, smallSideLength, `black`, true, offsetBlack ); // Reverse small triangles
                }

                distanceToCenter = Math.abs( x + offsetX );
                offsetWhite = 3 * distanceToCenter / ( sideLength / 2 );
                offsetBlack = 2 * distanceToCenter / ( sideLength / 2 );
            }
        }

        this.drawXorTriangle( sideLength );

        this.ctx.restore();

        //this.drawCenter()
    }

    drawSmallTriangle( x, y, length, fillStyle, flipped, offset = 0 ) {
        let scale = 1.0 - this.clamp( this.triangleState - offset, 0, 1 );

        // PlayButton Scale
        scale = MathHelper.mix(scale, offset * 0.9, this.playButtonState) + Math.sin( this.elapsed ) * 0.3 * this.playButtonState

        const newLength = length * scale; // New length of the small triangle
        const h = newLength * Math.sqrt( 3 ) / 2; // New height of the small triangle
        const oldHeight = length * Math.sqrt( 3 ) / 2; // Old height of the small triangle

        // Offset for the center of mass
        const offsetY = ( oldHeight - h ) / 3;

        this.ctx.beginPath();
        if ( !flipped ) {
            // Basis triangle
            this.ctx.moveTo( x, y + h / 2 - offsetY );
            this.ctx.lineTo( x + newLength / 2, y - h / 2 - offsetY );
            this.ctx.lineTo( x - newLength / 2, y - h / 2 - offsetY );
        } else {
            // Reversed triangle
            this.ctx.moveTo( x, y - h / 2 - offsetY );
            this.ctx.lineTo( x + newLength / 2, y + h / 2 - offsetY );
            this.ctx.lineTo( x - newLength / 2, y + h / 2 - offsetY );
        }
        this.ctx.closePath();
        this.ctx.fillStyle = fillStyle; // Color of the small triangle
        this.ctx.fill();

        // add border
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

    }

    resize() {
        this.preloader.width = window.innerWidth;
        this.preloader.height = window.innerHeight;

        this.cw = this.preloader.width;
        this.ch = this.preloader.height;
        this.centerX = this.preloader.width / 2;
        this.centerY = this.preloader.height / 2;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
        this.ctx.fillRect( 0, 0, this.cw, this.ch );

        this.preloader.setAttribute( "width", this.cw );
        this.preloader.setAttribute( "height", this.ch );

        this.aspectRatio = 1 / window.innerHeight
    }

    initStars() {
        this.ctx.strokeStyle = "white";
        this.ctx.shadowColor = "white";
        for ( let i = 0; i < this.initStarsPopulation; i++ ) {
            this.stars[ i ] = new Star( i, Math.floor( Math.random() * this.cw ), Math.floor( Math.random() * this.ch ) );
            //stars[i].draw();
        }
        this.ctx.shadowBlur = 0;
    }

    drawStars() {
        this.ctx.save()

        //ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for ( let i in this.stars ) {
            this.stars[ i ].move();
        }
        for ( let i in this.dots ) {
            this.dots[ i ].move();
        }

        this.ctx.restore()
    }

    drawXorTriangle( sideLength ) {
        this.ctx.globalCompositeOperation = 'xor';

        this.ctx.rotate( Math.PI * this.animationState ); // Rotation of the big triangle

        // Draw the big triangle
        let mainSideLength = sideLength * 100 * this.animationState;
        let mainHeight = mainSideLength * Math.sqrt( 3 ) / 2 - 4;
        let mainCentroidY = mainHeight / 6;
        this.ctx.beginPath();
        this.ctx.moveTo( -mainSideLength / 2, -mainHeight / 2 + mainCentroidY );
        this.ctx.lineTo( mainSideLength / 2, -mainHeight / 2 + mainCentroidY );
        this.ctx.lineTo( 0, mainHeight / 2 + mainCentroidY );
        this.ctx.closePath();
        this.ctx.fillStyle = `rgba(0,0,0,${this.animationState + 1})`; // Color of the big triangle
        this.ctx.fill();
    }

    drawCenter() {
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc( this.cw / 2, this.ch / 2, 1, 0, 2 * Math.PI );
        this.ctx.fill();
    }

    showPreloader() {
        this.preloader.style.pointerEvents = 'all';
        this.preloader.style.display = 'block';
        this.activePreloader = true;
        clearInterval( this.animationInterval );
        this.animationState = 1;
        let startTime = Date.now();
        let interval = this.animationInterval = setInterval( () => {
            if ( this.animationState <= 0.0 ) {
                clearInterval( interval );
                return;
            }
            this.animationState = 1.0 - this.easeOutCubic( ( Date.now() - startTime ) / 1000 * 1.6 );
        } );
    }

    hidePreloader() {
        this.preloader.style.pointerEvents = 'none';
        clearInterval( this.animationInterval );
        this.animationState = 0;
        let startTime = Date.now();
        let interval = this.animationInterval = setInterval( () => {
            if ( this.animationState >= 1 ) {
                clearInterval( interval );
                this.activePreloader = false;
                this.preloader.style.display = 'none';
                return;
            }
            this.animationState = this.expoInOut( ( Date.now() - startTime ) / 1000 );
        } );
    }

    showPlayButton(callback = () => {}) {
        this.preloader.style.cursor = 'pointer';

        let startTime = Date.now();
        let animationState = 0
        const targetAngle = -Math.PI / 1.95

        let interval = this.animationInterval = setInterval( () => {
            if ( animationState >= 1 ) {
                clearInterval( interval );
                return;
            }
            animationState = this.expoInOut( ( Date.now() - startTime ) / 1000 );
            this.playButtonState = animationState
            this.playButtonAngle = targetAngle * animationState;
        } );

        this.preloader.addEventListener( 'click', () => {
            this.hidePreloader()
            callback()
        }, { once: true } )


        //this.animationState -= 0.001;
        //console.log(Math.PI)
    }

    expoInOut( t ) {
        return t === 0 || t === 1 ? t : t < 0.5 ? +0.5 * Math.pow( 2, ( 20 * t ) - 10 ) : -0.5 * Math.pow( 2, 10 - ( t * 20 ) ) + 1;
    }

    expoIn( t ) {
        return t === 0 ? 0 : Math.pow( 2, 10 * ( t - 1 ) );
    }

    expoOut( t ) {
        return t === 1 ? t : 1 - Math.pow( 2, -10 * t );
    }

    easeOutCubic( t ) {
        return ( --t ) * t * t + 1;
    }

    clamp( num, min, max ) {
        return num <= min ? min : num >= max ? max : num;
    }

    remap( value, low1, high1, low2, high2 ) {
        return low2 + ( value - low1 ) * ( high2 - low2 ) / ( high1 - low1 );
    }
}

new Preloader()
