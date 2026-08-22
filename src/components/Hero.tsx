'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { DHACK_2026_CONFIG } from '@/lib/dhack2026';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Countdown Timer Component
const CountdownTimer = () => {
  const [label, setLabel] = useState<string>('Round 02 Submission Deadline');
  const [closed, setClosed] = useState(false);
  const [targetIso, setTargetIso] = useState(DHACK_2026_CONFIG.countdownTargetAt);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        const json = await res.json();
        if (mounted && json?.settings?.countdownTargetAt) {
          setTargetIso(json.settings.countdownTargetAt);
        }
      } catch {}
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const target = new Date(targetIso);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = target.getTime() - now;
      if (difference <= 0) {
        setClosed(true);
        setLabel('Round 02 Submission Closed');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setClosed(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  return (
    <div className='mt-6'>
      {closed ? (
        <div className='rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-center font-semibold text-red-300'>
          Round 02 Submission Closed
        </div>
      ) : label && (
        <div className='text-center text-sm text-muted-foreground mb-2'>
          {label}
        </div>
      )}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div
            key={unit}
            className='text-center p-3 md:p-4 bg-dhack-base/50 rounded-lg border border-dhack-teal/30 animate-fade-in-scale'
          >
            <div className='text-3xl md:text-4xl font-heading font-bold gradient-text'>
              {value.toString().padStart(2, '0')}
            </div>
            <div className='text-sm text-muted-foreground capitalize font-mono tracking-wider'>
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Error Boundary for 3D Components
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        // Render fallback via drei Html so DOM is not injected directly into the Canvas scene graph
        <Html center>
          <div className='flex items-center justify-center h-64 bg-dhack-base/50 rounded-lg'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-dhack-teal/20 flex items-center justify-center'>
                <span className='text-2xl'>🤖</span>
              </div>
              <p className='text-muted-foreground'>
                3D Scene temporarily unavailable
              </p>
            </div>
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}

// 3D Scene Component
function RobotExpressiveScene() {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const activeRef = useRef<THREE.AnimationAction | null>(null);

  const gltf = useLoader(
    GLTFLoader,
    'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb'
  );

  useEffect(() => {
    if (!gltf || !group.current) return;

    const currentGroup = group.current;
    const model = gltf.scene;
    model.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += 1.0;

    currentGroup.add(model);

    const mixer = new THREE.AnimationMixer(model);
    mixerRef.current = mixer;

    actionsRef.current = {};
    gltf.animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      actionsRef.current[clip.name] = action;
      const oneShots = [
        'Jump',
        'Yes',
        'No',
        'Wave',
        'Punch',
        'ThumbsUp',
        'Death',
        'Sitting',
        'Standing',
        'Dance',
      ];
      if (oneShots.includes(clip.name)) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    });

    const base =
      actionsRef.current['Walking'] ??
      actionsRef.current['Idle'] ??
      Object.values(actionsRef.current)[0];

    if (base) {
      activeRef.current = base;
      base.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      actionsRef.current = {};
      activeRef.current = null;
      if (currentGroup) currentGroup.clear();
    };
  }, [gltf]);

  const fadeToAction = (name: string, duration = 0.3) => {
    const mixer = mixerRef.current;
    const actions = actionsRef.current;
    if (!mixer || !actions[name]) return;

    const previous = activeRef.current;
    const next = actions[name];
    if (previous !== next) previous?.fadeOut(duration);
    next
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();
    activeRef.current = next;
  };

  useEffect(() => {
    const emotes = ['Wave', 'Jump', 'ThumbsUp', 'Yes', 'No', 'Punch'] as const;
    const id = setInterval(() => {
      if (Math.random() < 0.34) {
        const pick = emotes[Math.floor(Math.random() * emotes.length)];
        fadeToAction(pick, 0.2);
        setTimeout(() => fadeToAction('Walking', 0.25), 1500);
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    if (group.current) {
      group.current.rotation.x = 0;
      group.current.rotation.z = 0;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.8} />
      <hemisphereLight
        args={['#1EC0C3', '#0F101E', 0.6]}
        position={[0, 2, 0]}
      />
      <directionalLight
        position={[2, 4, 3]}
        color='#F18C24'
        intensity={1.5}
        castShadow
      />
      {/* Additional fill light for better visibility */}
      <directionalLight
        position={[-2, 2, -2]}
        color='#ffffff'
        intensity={0.4}
        castShadow
      />
    </group>
  );
}

// Main Hero Component
const Hero = () => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [robotInteractionEnabled, setRobotInteractionEnabled] = useState(false);
  const [inView, setInView] = useState(true);
  const [submissionClosed, setSubmissionClosed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Detect mobile devices
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(mobile);
      // Disable interaction by default on mobile
      if (mobile) {
        setRobotInteractionEnabled(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      window.removeEventListener('resize', checkMobile as any);
      observer.disconnect();
    };
  }, []);

  const onCtaClick = () => {
    if (submissionClosed) return;
    window.location.href = '/round-02-submission';
  };

  useEffect(() => {
    let mounted = true;
    const update = (closeIso = DHACK_2026_CONFIG.countdownTargetAt) => {
      if (mounted) setSubmissionClosed(Date.now() >= new Date(closeIso).getTime());
    };
    const load = async () => {
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        const json = await res.json();
        update(json?.settings?.countdownTargetAt);
      } catch {
        update();
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Auto-disable robot interaction on mobile after inactivity
  useEffect(() => {
    if (isMobile && robotInteractionEnabled) {
      const timeout = setTimeout(() => {
        setRobotInteractionEnabled(false);
      }, 30000); // Auto-disable after 30 seconds of inactivity

      return () => clearTimeout(timeout);
    }
  }, [isMobile, robotInteractionEnabled]);

  return (
    <section
      id='home'
      ref={sectionRef as any}
      className='relative pt-10 lg:pt-16 pb-16 lg:pb-24 min-h-screen'
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground) / 0.06) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground) / 0.06) 1px, transparent 1px)
        `,
        backgroundSize: `clamp(30px, 8vw, 60px) clamp(30px, 8vw, 60px)`,
      }}
    >
      <div className='relative z-10 max-w-1200 mx-auto px-4 sm:px-6 lg:px-8 pt-header'>
        {/* Mobile: Title First */}
        <div className='flex flex-col justify-center text-center lg:text-left lg:hidden order-1 animate-fade-in-up'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-6 text-balance tracking-tight leading-tight'>
            The Ultimate <span className='gradient-text'>Designathon</span>{' '}
            Challenge{' '}
            <span className='gradient-text font-heading'>DHACK&apos;26</span>
          </h1>
        </div>

        {/* Mobile: Robot Second */}
        <div className='rounded-2xl overflow-hidden lg:hidden order-2 mb-8 animate-fade-in-left'>
          <div className='relative h-[420px] md:h-[520px]'>
            {isClient && (
              <div className='relative w-full h-full'>
                <Canvas
                  frameloop={inView ? 'always' : 'never'}
                  camera={{ position: [-3.8, 2.0, 6.3], fov: 45 }}
                  shadows
                  style={{
                    pointerEvents:
                      isMobile && !robotInteractionEnabled ? 'none' : 'auto',
                  }}
                >
                  <Suspense fallback={null}>
                    <ThreeErrorBoundary>
                      <RobotExpressiveScene />
                    </ThreeErrorBoundary>
                  </Suspense>
                  {robotInteractionEnabled && (
                    <OrbitControls
                      enablePan={false}
                      enableZoom={false}
                      minDistance={2.5}
                      maxDistance={8}
                      enableDamping
                      autoRotate={inView && !robotInteractionEnabled}
                      autoRotateSpeed={0.45}
                      target={[0, 1.0, 0]}
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 2}
                    />
                  )}
                </Canvas>

                {/* Mobile Interaction Toggle */}
                {isMobile && (
                  <div className='absolute top-4 right-4 z-10 space-y-2'>
                    <button
                      onClick={() =>
                        setRobotInteractionEnabled(!robotInteractionEnabled)
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        robotInteractionEnabled
                          ? 'bg-dhack-teal text-white shadow-lg'
                          : 'bg-dhack-base/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-dhack-teal/30'
                      }`}
                    >
                      {robotInteractionEnabled
                        ? '👆 Exit Interact'
                        : '👆 Tap to Interact'}
                    </button>
                    {robotInteractionEnabled && (
                      <div className='text-xs text-dhack-teal bg-dhack-base/90 backdrop-blur-sm px-2 py-1 rounded border border-dhack-teal/30'>
                        Auto-exits in 30s
                      </div>
                    )}
                  </div>
                )}

                {/* Overlay to prevent accidental touches when interaction is disabled */}
                {isMobile && !robotInteractionEnabled && (
                  <div
                    className='absolute inset-0 bg-transparent'
                    style={{ pointerEvents: 'auto' }}
                    onTouchStart={e => {
                      // Allow normal scrolling
                      e.stopPropagation();
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Countdown Timer Third */}
        <div className='max-w-2xl mx-auto lg:mx-0 lg:hidden order-3 animate-fade-in-up-delay-300'>
          <CountdownTimer />
        </div>

        {/* Mobile: CTA Button Fourth */}
        <div className='mt-12 lg:hidden order-4 flex flex-col items-center gap-2 animate-fade-in-up-delay-500'>
          <Button
            variant='gradient'
            size='lg'
            onClick={onCtaClick}
            disabled={submissionClosed}
            className='text-sm px-8 py-4 '
          >
            {submissionClosed ? 'Round 2 Submission Closed' : 'Submit Round 2'}
          </Button>
          <p className='text-center text-xs text-muted-foreground'>
            Round 2 submissions are open exclusively to teams selected for
            Round 2.
          </p>
        </div>

        {/* Desktop Layout */}
        <div className='hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch'>
          {/* Left: Animation Card */}
          <div className='rounded-2xl overflow-hidden animate-fade-in-left'>
            <div className='relative h-[420px] md:h-[520px]'>
              {isClient && (
                <Canvas
                  frameloop={inView ? 'always' : 'never'}
                  camera={{ position: [-3.8, 2.0, 6.3], fov: 45 }}
                  shadows
                >
                  <Suspense fallback={null}>
                    <ThreeErrorBoundary>
                      <RobotExpressiveScene />
                    </ThreeErrorBoundary>
                  </Suspense>
                  <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minDistance={2.5}
                    maxDistance={8}
                    enableDamping
                    autoRotate={inView}
                    autoRotateSpeed={0.45}
                    target={[0, 1.0, 0]}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                  />
                </Canvas>
              )}
            </div>
          </div>

          {/* Right: Texts/CTA */}
          <div className='flex flex-col justify-center text-center lg:text-left animate-fade-in-up'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-6 text-balance tracking-tight leading-tight'>
              The Ultimate <span className='gradient-text'>Designathon</span>{' '}
              Challenge{' '}
              <span className='gradient-text font-heading'>DHACK&apos;26</span>
            </h1>

            {/* Design Tools */}
            <div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-8 flex-wrap animate-fade-in-scale-delay-200'>
              <div className='flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 48 48'
                >
                  <path
                    fill='#e64a19'
                    d='M26,17h-8c-3.866,0-7-3.134-7-7v0c0-3.866,3.134-7,7-7h8V17z'
                  ></path>
                  <path
                    fill='#7c4dff'
                    d='M25,31h-7c-3.866,0-7-3.134-7-7v0c0-3.866,3.134-7,7-7h7V31z'
                  ></path>
                  <path
                    fill='#66bb6a'
                    d='M18,45L18,45c-3.866,0-7-3.134-7-7v0c0-3.866,3.134-7,7-7h7v7C25,41.866,21.866,45,18,45z'
                  ></path>
                  <path
                    fill='#ff7043'
                    d='M32,17h-7V3h7c3.866,0,7,3.134,7,7v0C39,13.866,35.866,17,32,17z'
                  ></path>
                  <circle cx='32' cy='24' r='7' fill='#29b6f6'></circle>
                </svg>
                <span className='text-muted-foreground font-medium'>Figma</span>
              </div>
              <div className='text-dhack-teal'>+</div>
              <div className='flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 48 48'
                >
                  <path
                    fill='#ff41c8'
                    d='M6,10c0-2.209,1.791-4,4-4h28c2.209,0,4,1.791,4,4v28c0,2.209-1.791,4-4,4H10c-2.209,0-4-1.791-4-4 V10z'
                  ></path>
                  <path
                    fill='#16020b'
                    d='M9,9v30h30V9H9z M19.093,21.695l1.914-4.883h3.291l-3.34,7.051l3.418,7.168h-3.33l-1.953-4.971 l-1.943,4.971h-3.33l3.418-7.168l-3.35-7.051h3.291L19.093,21.695z M25.069,25.426c0-1.732,0.293-3.024,0.879-3.877 s1.438-1.279,2.559-1.279c0.813,0,1.491,0.352,2.031,1.055v-5.293h2.783v15h-2.51l-0.127-1.074c-0.566,0.847-1.296,1.27-2.188,1.27 c-1.106,0-1.951-0.423-2.534-1.27s-0.881-2.09-0.894-3.73V25.426z M27.843,26.119c0,1.042,0.11,1.77,0.332,2.183 s0.596,0.62,1.123,0.62c0.547,0,0.96-0.244,1.24-0.732v-4.824c-0.273-0.521-0.684-0.781-1.23-0.781 c-0.508,0-0.879,0.205-1.113,0.615s-0.352,1.14-0.352,2.188V26.119z'
                  ></path>
                </svg>
                <span className='text-muted-foreground font-medium'>
                  Adobe XD
                </span>
              </div>
              <div className='text-dhack-teal'>+</div>
              <div className='flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  viewBox='0 0 100 100'
                >
                  <polygon
                    fill='#f9e65c'
                    points='15.398,40.469 50,82 85,40.469'
                  ></polygon>
                  <polygon
                    fill='#f9e65c'
                    points='29.963,20.893 16.255,40.362 28.948,40.362'
                  ></polygon>
                  <polygon
                    fill='#f9e65c'
                    points='70.383,20.893 84.09,40.362 71.398,40.362'
                  ></polygon>
                  <polygon
                    fill='#fef6aa'
                    points='29.518,40.386 50.081,18.384 71.015,40.766'
                  ></polygon>
                  <polygon
                    fill='#f9e65c'
                    points='70,20.893 71.015,40.362 49.926,18.277'
                  ></polygon>
                  <polygon
                    fill='#f9e65c'
                    points='29.963,20.893 28.948,40.362 50.037,18.277'
                  ></polygon>
                  <polygon
                    fill='none'
                    stroke='#1f212b'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeMiterlimit='10'
                    strokeWidth='2'
                    points='70,21 50,18 30,21 15,41 50,82 85,40.469'
                  ></polygon>
                  <line
                    x1='15'
                    x2='85'
                    y1='40.469'
                    y2='40.469'
                    fill='none'
                    stroke='#1f212b'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeMiterlimit='10'
                  ></line>
                  <polyline
                    fill='none'
                    stroke='#1f212b'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeMiterlimit='10'
                    points='30,21 28.985,40.469 50.298,18.17'
                  ></polyline>
                  <line
                    x1='28.985'
                    x2='50'
                    y1='40.469'
                    y2='82'
                    fill='#eddc67'
                    stroke='#1f212b'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeMiterlimit='10'
                  ></line>
                  <polyline
                    fill='none'
                    stroke='#1f212b'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeMiterlimit='10'
                    points='70,21 71.015,40.469 49.926,18.384'
                  ></polyline>
                  <line
                    x1='71.015'
                    x2='50'
                    y1='40.469'
                    y2='82'
                    fill='none'
                    stroke='#1f212b'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeMiterlimit='10'
                  ></line>
                </svg>
                <span className='text-muted-foreground font-medium'>
                  Sketch
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className='max-w-2xl mx-auto lg:mx-0 animate-fade-in-up-delay-300'>
              <CountdownTimer />
            </div>

            {/* CTA Button */}
            <div className='mt-12 animate-fade-in-up-delay-500'>
              <Button
                variant='gradient'
                size='lg'
                onClick={onCtaClick}
                disabled={submissionClosed}
                className='text-lg px-8 py-4'
              >
                {submissionClosed ? 'Round 2 Submission Closed' : 'Submit Round 2'}
              </Button>
              <p className='mt-3 text-sm text-muted-foreground'>
                Round 2 submissions are open exclusively to teams selected
                for Round 2.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none' />
    </section>
  );
};

export default Hero;
