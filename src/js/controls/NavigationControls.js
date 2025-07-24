/**
 * NavigationControls - 6DoF navigation system for keyboard, mouse, and touch
 */

import * as THREE from 'three';

export class NavigationControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement state
    this.moveState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    };

    // Control state
    this.isPaused = false;

    // Movement settings
    this.moveSpeed = 10.0;
    this.rotationSpeed = 0.002;
    this.dampingFactor = 0.1;

    // Velocity and rotation
    this.velocity = new THREE.Vector3();
    this.targetVelocity = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    // Mouse state
    this.isPointerLocked = false;
    this.mouseX = 0;
    this.mouseY = 0;

    // Touch state
    this.touchState = {
      isActive: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    };

    // Bind methods
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  /**
   * Initialize the navigation controls
   */
  init() {
    this.setupEventListeners();

    // Set initial camera rotation
    this.euler.setFromQuaternion(this.camera.quaternion);

    console.log('✅ NavigationControls initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);

    // Mouse events
    this.domElement.addEventListener('click', this.onClick, false);
    document.addEventListener('mousemove', this.onMouseMove, false);

    // Pointer lock events
    document.addEventListener(
      'pointerlockchange',
      this.onPointerLockChange,
      false
    );
    document.addEventListener(
      'pointerlockerror',
      this.onPointerLockChange,
      false
    );

    // Touch events
    this.domElement.addEventListener('touchstart', this.onTouchStart, false);
    this.domElement.addEventListener('touchmove', this.onTouchMove, false);
    this.domElement.addEventListener('touchend', this.onTouchEnd, false);

    // Prevent context menu
    this.domElement.addEventListener(
      'contextmenu',
      event => {
        event.preventDefault();
      },
      false
    );
  }

  /**
   * Handle keyboard down events
   */
  onKeyDown(event) {
    switch (event.code) {
    case 'KeyW':
      this.moveState.forward = true;
      break;
    case 'KeyS':
      this.moveState.backward = true;
      break;
    case 'KeyA':
      this.moveState.left = true;
      break;
    case 'KeyD':
      this.moveState.right = true;
      break;
    case 'KeyQ':
      this.moveState.up = true;
      break;
    case 'KeyE':
      this.moveState.down = true;
      break;
    case 'Escape':
      if (this.isPointerLocked) {
        document.exitPointerLock();
      }
      break;
    }
  }

  /**
   * Handle keyboard up events
   */
  onKeyUp(event) {
    switch (event.code) {
    case 'KeyW':
      this.moveState.forward = false;
      break;
    case 'KeyS':
      this.moveState.backward = false;
      break;
    case 'KeyA':
      this.moveState.left = false;
      break;
    case 'KeyD':
      this.moveState.right = false;
      break;
    case 'KeyQ':
      this.moveState.up = false;
      break;
    case 'KeyE':
      this.moveState.down = false;
      break;
    }
  }

  /**
   * Handle mouse click (request pointer lock)
   */
  onClick() {
    if (!this.isPointerLocked) {
      this.domElement.requestPointerLock();
    }
  }

  /**
   * Handle mouse movement
   */
  onMouseMove(event) {
    if (!this.isPointerLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.y -= movementX * this.rotationSpeed;
    this.euler.x -= movementY * this.rotationSpeed;

    // Clamp vertical rotation
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
  }

  /**
   * Handle pointer lock change
   */
  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  /**
   * Handle touch start
   */
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.touchState.isActive = true;
      this.touchState.startX = event.touches[0].clientX;
      this.touchState.startY = event.touches[0].clientY;
      this.touchState.currentX = this.touchState.startX;
      this.touchState.currentY = this.touchState.startY;
    }

    event.preventDefault();
  }

  /**
   * Handle touch move
   */
  onTouchMove(event) {
    if (!this.touchState.isActive || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchState.currentX;
    const deltaY = touch.clientY - this.touchState.currentY;

    // Apply rotation based on touch movement
    this.euler.y -= deltaX * this.rotationSpeed * 2;
    this.euler.x -= deltaY * this.rotationSpeed * 2;

    // Clamp vertical rotation
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

    this.touchState.currentX = touch.clientX;
    this.touchState.currentY = touch.clientY;

    event.preventDefault();
  }

  /**
   * Handle touch end
   */
  onTouchEnd(event) {
    this.touchState.isActive = false;
    event.preventDefault();
  }

  /**
   * Update the controls
   */
  update(deltaTime) {
    // Skip update if controls are paused
    if (this.isPaused) {
      return;
    }

    // Store previous camera position for debugging
    const prevPosition = this.camera.position.clone();

    // Calculate target velocity based on input
    this.targetVelocity.set(0, 0, 0);

    if (this.moveState.forward) this.targetVelocity.z -= 1;
    if (this.moveState.backward) this.targetVelocity.z += 1;
    if (this.moveState.left) this.targetVelocity.x -= 1;
    if (this.moveState.right) this.targetVelocity.x += 1;
    if (this.moveState.up) this.targetVelocity.y += 1;
    if (this.moveState.down) this.targetVelocity.y -= 1;

    // Normalize and scale by move speed
    if (this.targetVelocity.length() > 0) {
      this.targetVelocity.normalize().multiplyScalar(this.moveSpeed);
    }

    // Apply damping to velocity
    this.velocity.lerp(this.targetVelocity, this.dampingFactor);

    // Apply rotation to camera
    this.camera.quaternion.setFromEuler(this.euler);

    // Apply movement relative to camera orientation
    const moveVector = this.velocity.clone().multiplyScalar(deltaTime);
    moveVector.applyQuaternion(this.camera.quaternion);
    this.camera.position.add(moveVector);

    // Debug: Log significant camera position changes (for debugging camera jumps)
    const positionChange = this.camera.position.distanceTo(prevPosition);
    if (positionChange > 1.0) { // Only log significant movements
      console.log(`📹 Navigation controls moved camera:`, {
        change: positionChange.toFixed(3),
        newPosition: this.camera.position.toArray().map(v => v.toFixed(3))
      });
    }
  }

  /**
   * Set movement speed
   */
  setMoveSpeed(speed) {
    this.moveSpeed = Math.max(0.1, speed);
  }

  /**
   * Get current movement speed
   */
  getMoveSpeed() {
    return this.moveSpeed;
  }

  /**
   * Set rotation sensitivity
   */
  setRotationSpeed(speed) {
    this.rotationSpeed = Math.max(0.0001, Math.min(0.01, speed));
  }

  /**
   * Get camera position
   */
  getPosition() {
    return this.camera.position.clone();
  }

  /**
   * Set camera position
   */
  setPosition(position) {
    this.camera.position.copy(position);
  }

  /**
   * Look at target
   */
  lookAt(target) {
    const direction = target.clone().sub(this.camera.position).normalize();
    this.euler.y = Math.atan2(direction.x, direction.z);
    this.euler.x = Math.asin(-direction.y);
  }

  /**
   * Reset velocity to stop any movement
   */
  resetVelocity() {
    this.velocity.set(0, 0, 0);
    this.targetVelocity.set(0, 0, 0);
    console.log(`🛑 Navigation velocity reset`);
  }

  /**
   * Pause/unpause navigation controls
   */
  setPaused(paused) {
    this.isPaused = paused;
    if (paused) {
      console.log(`⏸️ Navigation controls paused`);
    } else {
      // When resuming, ensure euler angles are synchronized with current camera orientation
      // to prevent any potential jumps
      this.syncEulerWithCamera();
      console.log(`▶️ Navigation controls resumed`);
    }
  }

  /**
   * Synchronize euler angles with current camera orientation
   */
  syncEulerWithCamera() {
    const tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    tempEuler.setFromQuaternion(this.camera.quaternion);
    this.euler.copy(tempEuler);

    console.log(`🔄 Navigation controls euler synchronized with camera`);
  }

  /**
   * Dispose of the controls
   */
  dispose() {
    // Remove event listeners
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('pointerlockerror', this.onPointerLockChange);

    this.domElement.removeEventListener('click', this.onClick);
    this.domElement.removeEventListener('touchstart', this.onTouchStart);
    this.domElement.removeEventListener('touchmove', this.onTouchMove);
    this.domElement.removeEventListener('touchend', this.onTouchEnd);

    // Exit pointer lock if active
    if (this.isPointerLocked) {
      document.exitPointerLock();
    }

    console.log('🧹 NavigationControls disposed');
  }
}
