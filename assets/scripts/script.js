window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')
    canvas.width = 1280;
    canvas.height = 720;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';

    class Player {
        constructor(game) {
            this.game = game
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY=0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;
            this.frameX = 0;
            this.frameY = 0;
            this.image = document.getElementById('bull')
            this.spriteHeight = 256;
            this.spriteWidth = 255;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.width * 0.5;
        }
        draw(context) {
            if (this.game.debug == true) {
                drawCollisionCircle(context, this)
                context.stroke();
                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y)
                context.stroke();
            }
           context.drawImage(
            this.image, 
            this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth, 
            this.spriteHeight, 
            this.spriteX,
            this.spriteY,
            this.width,
            this.height
        ) 
        }

        update() {
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            const angle = Math.atan2(this.dy, this.dx)
            if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7;
            else if (angle < -1.17) this.frameY = 0;
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < -1.17) this.frameY = 3;
            else if (angle < 1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;
            const distance  = Math.hypot(this.dy, this.dx)
            if (distance >  this.speedModifier) {
                this.speedX = this.dx / distance || 0;
                this.speedY = this.dy / distance || 0;
            } else {
                this.speedX = 0
                this.speedY = 0
            }
            this.collisionX += this.speedX * this.speedModifier; 
            this.collisionY += this.speedY * this.speedModifier;

            // Update sprite position:
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.width * 0.5 - 100;

            // horizontal boundaries
            if (this.collisionX < this.collisionRadius) this.collisionX = this.collisionRadius
            else if (this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius

            // vertical boundaries
            if (this.collisionY < 0 + this.game.topMargin +this.collisionRadius) {
                this.collisionY = 0 + this.game.topMargin + this.collisionRadius
            }
            if (this.collisionY > this.game.height - this.collisionRadius) {
                this.collisionY = this.game.height - this.collisionRadius
            }

            // Player/obstacle collision algo:
            this.game.obstacles.forEach(o => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, o)
                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = o.collisionX + (sumOfRadii + 1) * unit_x
                    this.collisionY = o.collisionY + (sumOfRadii + 1) * unit_y
                }
             })
        }
    }

    class Obstacle {
        constructor(game) {
            this.game = game
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 35;
            this.image = document.getElementById('obstacles')
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5;
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        }

        
        draw(context) {
           context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY - 75, this.width, this.height);
           drawCollisionCircle(context, this)
        }
         update() {}
    }

    class Egg {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius *2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin /2 )) ;
            this.image = document.getElementById('egg')
            this.spriteHeight = 135;
            this.spriteWidth = 110;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.75 ;
        }

        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight)
            drawCollisionCircle(context, this)
        }

        update() {
            let collisionObject = [this.game.player, ...this.game.obstacles]
            collisionObject.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object)
                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y
                }
            })
            
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.75; 
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas
            this.width = this.canvas.width;
            this.height= this.canvas.height;
            this.player = new Player(this)
            this.obstacles = []
            this.eggs = []
            this.maxEggs = 10;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.numberOfObstacles = 10;
            this.topMargin = 260;
            this.debug = false;
            this.fps = 70;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

        // event listeners
        canvas.addEventListener('mousedown', (e) => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.mouse.pressed = true;
        })
        canvas.addEventListener('mouseup', (e) => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.mouse.pressed = false;
        })
        canvas.addEventListener('mousemove', (e) => {
            if (this.mouse.pressed) {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
            }
        })
        window.addEventListener('keydown', e => {
            if (e.key == "d") {
                this.debug = !this.debug
            }
        })

        }
        addEgg() {
            this.eggs.push(new Egg(this))
        }
        render(context, deltaTime) {
            if (this.timer > this.interval) {
                context.clearRect(0,0, this.width, this.height)
                this.gameObjects = [...this.eggs, ...this.obstacles, this.player]
                this.gameObjects.sort((a, b) => a.collisionY - b.collisionY)
                this.gameObjects.forEach(object => {
                    object.draw(context)
                    object.update()
                });
                this.timer = 0;
            }
            this.timer += deltaTime

            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
               this.addEgg() 
               this.eggTimer = 0;
                console.log(this.eggs)

            } else {
                this.eggTimer += deltaTime
            }
        }

        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX
            const dy = a.collisionY - b.collisionY
            const sumOfRadii = a.collisionRadius + b.collisionRadius 
            const distance = Math.hypot(dy, dx)
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        }
         
        init() {
            let attempts= 0;
            while(this.obstacles.length < this.numberOfObstacles && attempts < 500) {
                let testObstacle = new Obstacle(this)    
                let overlap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY
                    const distance = Math.hypot(dy, dx);
                    const distanceBuffer = 150;
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer
                    if (distance <= sumOfRadii) {
                        overlap = true;
                    };
                })
                const margin = testObstacle.collisionRadius * 3;
                    if (!overlap && testObstacle.spriteX > 0 
                        && testObstacle.spriteX < this.width 
                        && testObstacle.collisionY > this.topMargin + margin
                        && testObstacle.collisionY < this.height - margin ) {
                        this.obstacles.push(testObstacle);
                    }
                    attempts++
            }
        }
    }

    const game= new Game(canvas);
    game.init()
    console.log(game)

    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp
        game.render(ctx, deltaTime)
            requestAnimationFrame(animate)
    }
    animate(0)
})

function drawCollisionCircle(context, object) {
    if (object.game.debug) {
        context.beginPath(); 
        context.arc(object.collisionX, object.collisionY, object.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
    }
}