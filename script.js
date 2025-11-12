// --- 페이지 로드 후 실행될 스크립트 ---
document.addEventListener('DOMContentLoaded', () => {

    // (추가) 새로고침 시 최상단으로 이동
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // --- (추가) 서명 애니메이션 준비 코드 ---
    // 페이지 로드 시 서명 경로의 총 길이를 계산하여 CSS 변수로 설정합니다.
    // (수정) 버튼 클릭 시 애니메이션을 실행하므로, 페이지 로드 시에는 아무것도 하지 않습니다.
    const loader = document.getElementById('loader-wrapper');
    const content = document.getElementById('content');
    const startPrompt = document.getElementById('start-prompt');
    let soundEnabled = false; // 사운드 활성화 상태 추적

    // (추가) Web Audio API 설정
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = null; // 톤(소리)을 생성하는 노드
    let gainNode = null;   // 볼륨을 조절하는 노드

    // (추가) 사운드 재생 헬퍼 함수
    function playSound(soundId, volume = 0.5) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.load(); // (추가) 사운드를 재생하기 전에 명시적으로 로드합니다.
            sound.currentTime = 0; // 재생 위치를 처음으로
            sound.volume = volume;
            sound.play().catch(e => console.log(`Audio play failed for ${soundId}: ${e}`));
        }
    }

    // (추가) 메인 콘텐츠 애니메이션 및 사운드를 시작하는 함수
    function startMainContentAnimations() {
        // (추가) 함수 내에서 사용할 변수들을 먼저 선언합니다.
        const introSound = document.getElementById('intro-dribble-sound');
        const header = document.getElementById('main-header');
        const homeContent = document.querySelector('.home-content-inner');
        const customCursor = document.querySelector('.custom-cursor');
        const typingElement = document.getElementById('typing-philosophy');
        // (수정) JS로 애니메이션을 제어하기 위해 body에 클래스 추가
        document.body.classList.add('animations-started');

        // (수정) 인트로 텍스트가 바로 보이므로, 드리블 사운드도 바로 재생
        if (introSound) {
            playSound('intro-dribble-sound', 0.6);
        }

        // (수정) 인트로 애니메이션이 끝나는 시점(3.75s delay + 2s duration = 5.75s)에 맞춰 사운드 정지
        setTimeout(() => {
            const sound = document.getElementById('intro-dribble-sound');
            if (sound) sound.pause();
        }, 5750);

        // (추가) 0.75초 후: 텍스트가 사라지기 시작할 때 swoosh 사운드 재생
        setTimeout(() => {
            playSound('text-fade-sound', 0.5);
        }, 750);

        // (수정) 인트로 애니메이션이 끝난 후 헤더, 홈 콘텐츠, 타이핑, 커서 애니메이션 순차 실행

        // (수정) 6초: 헤더와 홈 콘텐츠 등장 (인트로가 끝난 직후)
        setTimeout(() => {
            // (수정) CSS transition을 사용하도록 opacity와 transform을 직접 변경
            if (header) {
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }
            if (homeContent) {
                homeContent.style.opacity = '1';
            }
            if (customCursor) { // 커서 표시
                customCursor.style.transition = 'opacity 0.5s ease-out';
                customCursor.style.opacity = '1';
            }
            // (수정) 6.2초: 타이핑 시작 (홈 콘텐츠 등장 후 0.2초 뒤)
            if (typingElement) {
                typeWriter(typingElement, typingElement.dataset.text, 60);
            }
        }, 6000);
    }

    // 로딩 및 사운드 재생을 시작하는 함수
    function startLoadingSequence() {
        const loaderDribbleSound = document.getElementById('loader-dribble-video');
        if (loaderDribbleSound) {
            // 기존 핸들러가 있다면 제거 (중복 방지)
            loaderDribbleSound.removeEventListener('ended', window.dribblePlayHandler);
            let playCount = 0;
            const maxPlays = 4;

            const playHandler = () => {
                playCount++;
                if (playCount < maxPlays) {
                    playSound('loader-dribble-video', 0.5);
                } else {
                    // 4번 재생 후 로더 사라지는 애니메이션 실행
                    loaderDribbleSound.removeEventListener('ended', window.dribblePlayHandler);
                    if (loader) {
                        loader.classList.add('is-loaded');
                        playSound('loader-dribble-video', 0.6);
                        setTimeout(() => playSound('loader-dribble-video', 0.5), 720);

                        // 애니메이션(1.2s) 후 로더 제거 및 콘텐츠 표시
                        setTimeout(() => {
                            loader.style.display = 'none';
                            if (content) {
                                content.style.visibility = 'visible';
                                content.style.opacity = '1';
                            }
                            document.body.style.overflow = 'auto';

                            // (추가) 로더가 사라진 후 메인 콘텐츠 애니메이션 시작
                            startMainContentAnimations();
                        }, 1200);
                    }
                }
            };

            // 핸들러를 전역에서 접근 가능하도록 저장
            window.dribblePlayHandler = playHandler;
            loaderDribbleSound.addEventListener('ended', window.dribblePlayHandler);
            playSound('loader-dribble-video', 0.5); // 첫 재생 시작
        }
    }

    // (삭제) 페이지 로드 시 자동 시작 로직 제거

    // 화면을 한 번 클릭하면 사운드를 활성화하고 로딩 시퀀스를 다시 시작
    function startExperience() {
        if (soundEnabled) return;
        soundEnabled = true;

        // 클릭 유도 문구 숨기기
        if (startPrompt) {
            startPrompt.style.display = 'none';
        }
        if (loader) {
            loader.style.cursor = 'default';
        }

        // 사운드와 함께 로딩 시퀀스 재시작
        startLoadingSequence();
        
        // (추가) Web Audio API 컨텍스트 활성화 (브라우저 정책)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // 이벤트 리스너 제거
        document.removeEventListener('click', startExperience);
    }
    document.addEventListener('click', startExperience);

    const initParticleField = () => {
        const canvas = document.getElementById('particle-field-canvas');
        if (!canvas) return;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10;
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 조명
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // (수정) 파티클 생성
        // --- (삭제) 이스터 에그: 염소자리 관련 데이터 생성 로직 전체 삭제 ---

        const particlesGeometry = new THREE.BufferGeometry;
        // (추가) 컨셉 변경: 경기장 조명 색상 팔레트
        const colors = [
            new THREE.Color('#FFFFFF'), // 기본 조명 (흰색)
            new THREE.Color('#f7b267'), // 포인트 컬러 1 (주황)
            new THREE.Color('#55a6d9'), // 포인트 컬러 2 (파랑)
        ];

        const particlesCnt = 7000; // 파티클 개수 증가
        const posArray = new Float32Array(particlesCnt * 3);
        for (let i = 0; i < particlesCnt * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20; // 분포 범위 확장
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // (추가) 각 파티클의 색상을 저장할 배열 생성
        const colorArray = new Float32Array(particlesCnt * 3);
        const defaultColor = new THREE.Color('#FFFFFF');
        for (let i = 0; i < particlesCnt; i++) {
            defaultColor.toArray(colorArray, i * 3);
        }
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        // (삭제) 별자리 위치 저장 로직 삭제

        // --- (추가) 별 모양 텍스처 생성 ---
        const starCanvas = document.createElement('canvas');
        starCanvas.width = 64;
        starCanvas.height = 64;
        const starCtx = starCanvas.getContext('2d');
        starCtx.fillStyle = '#FFFFFF'; // 별 색상
        starCtx.beginPath();
        starCtx.moveTo(32, 0);
        for (let i = 0; i < 11; i++) {
            const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
            const radius = i % 2 === 0 ? 32 : 14;
            starCtx.lineTo(32 + radius * Math.cos(angle), 32 + radius * Math.sin(angle));
        }
        starCtx.fill();
        const starTexture = new THREE.CanvasTexture(starCanvas);

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            vertexColors: true, // (수정) 개별 파티클 색상 사용
            transparent: true,
            opacity: 0.3, // (추가) 파티클 투명도를 낮춰서 덜 어지럽게 만듭니다.
            blending: THREE.AdditiveBlending, // 빛나는 효과
            depthWrite: false,
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // (추가) 마우스 위치 추적
        const mouse = new THREE.Vector2();
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // (추가) 별자리 애니메이션 상태 변수
        let isConstellationMode = false;

        // (추가) 이스터에그 상태를 변경하는 커스텀 이벤트 리스너
        window.addEventListener('setEasterEgg', (e) => {
            isConstellationMode = e.detail.enabled;
        });

        // (추가) 스킬 카드 호버 관련 변수
        let hoveredCardCenter = null; // (수정) 카드 중심점 좌표를 저장
        let glowRadius = 0;           // (추가) 빛이 퍼져나갈 반경
        let hoverHighlightColor = new THREE.Color('#FFFFFF');
        const tempColor = new THREE.Color(); // 색상 계산을 위한 임시 변수
        const originalPositions = particlesGeometry.attributes.position.clone(); // (추가) 파티클 초기 위치 저장

        // (추가) 밤하늘 효과를 위한 각 파티클의 고유 속성 저장
        const particleProperties = [];
        for (let i = 0; i < particlesCnt; i++) {
            particleProperties.push({
                twinkleSpeed: Math.random() * 2 + 0.5, // 0.5 ~ 2.5 사이의 반짝임 속도
                // (수정) 0~1 사이의 난수를 저장하여 색상을 다양하게 분기
                colorType: Math.random() 
            });
        }

        // (삭제) 30초마다 별자리 모드를 토글하는 타이머 제거

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            const currentPositions = particlesGeometry.attributes.position.array;
            const particleColors = particlesGeometry.attributes.color;
            const particlePositions = particlesGeometry.attributes.position;
            const tempVec = new THREE.Vector3();

            // (수정) 파티클 크기 기본값 설정
            particlesMaterial.size = THREE.MathUtils.lerp(particlesMaterial.size, 0.015, 0.05);
            particlesMesh.rotation.y += isConstellationMode ? 0.001 : 0.0003;

            for (let i = 0; i < particlesCnt; i++) {
                const i3 = i * 3;
                let targetColor = defaultColor;
                let influence = 0; // (추가) 파티클이 받는 영향력 (0 ~ 1)

                // (수정) 이스터에그: 별 모양으로 변경하는 로직
                if (isConstellationMode) { // 이스터에그 활성화 시
                    // (수정) 밤하늘 컨셉으로 전환
                    if (particlesMaterial.map !== starTexture) particlesMaterial.map = starTexture;
                    if (particlesMaterial.vertexColors) particlesMaterial.vertexColors = false;

                    // 개별 별의 크기와 밝기를 조절하여 반짝임 효과 생성
                    const i3 = i * 3;
                    const twinkleFactor = Math.pow((Math.sin(elapsedTime * particleProperties[i].twinkleSpeed) + 1) / 2, 2); // 0~1 사이 값, 밝은 쪽으로 치우침
                    const baseSize = originalPositions.array[i3 + 2] > 5 ? 0.15 : 0.08; // 멀리 있는 별은 더 크게
                    particlesMaterial.size = baseSize * (0.5 + twinkleFactor * 0.5); // 50% ~ 100% 크기
                    
                    // (수정) 모든 별을 네온 옐로우 색상으로 변경하고, 반짝임 효과 적용
                    // (수정) 밤하늘 컨셉에 맞게 네온 옐로우 색상으로 변경
                    const neonYellow = new THREE.Color('#FFFF00');
                    // twinkleFactor를 이용해 밝기를 조절하여 반짝이는 네온 효과를 만듭니다.
                    particlesMaterial.color.lerp(neonYellow.clone().multiplyScalar(0.7 + twinkleFactor * 0.3), 0.1);
                } 
                // (수정) 스킬 카드 호버 시 빛 퍼짐 효과 로직 (이스터에그 비활성화 시)
                else if (hoveredCardCenter) {
                    // 기본 점 모양으로 복귀
                    if (particlesMaterial.map !== null) particlesMaterial.map = null;
                    particlesMaterial.size = THREE.MathUtils.lerp(particlesMaterial.size, 0.015, 0.05);
                    if (!particlesMaterial.vertexColors) particlesMaterial.vertexColors = true;

                    tempVec.fromBufferAttribute(particlePositions, i);
                    tempVec.project(camera); // 3D -> 2D (NDC)

                    const distance = tempVec.distanceTo(hoveredCardCenter);
                    // 거리가 가까울수록 influence는 1에 가까워지고, 멀수록 0에 가까워짐
                    influence = Math.pow(1.0 - Math.min(distance / glowRadius, 1.0), 2.0);

                    // 영향력에 따라 기본 색상과 하이라이트 색상을 섞음
                    targetColor = new THREE.Color('#FFFFFF').lerp(hoverHighlightColor, influence);
                } else { // 이스터에그와 호버 모두 비활성화된 기본 상태
                    // 기본 상태로 복귀
                    particlesMaterial.size = THREE.MathUtils.lerp(particlesMaterial.size, 0.015, 0.05);
                    if (!particlesMaterial.vertexColors) particlesMaterial.vertexColors = true;

                    targetColor = new THREE.Color('#FFFFFF');
                }

                // (수정) 이스터에그가 아닐 때만 vertexColors를 사용하도록 분기
                if (!isConstellationMode) {
                    tempColor.fromArray(particleColors.array, i3);
                    tempColor.lerp(targetColor, 0.1);
                    tempColor.toArray(particleColors.array, i3);
                }

                // (수정) 파티클 위치 및 움직임 제어 (영향력 기반)
                const originalX = originalPositions.array[i3];
                const originalY = originalPositions.array[i3 + 1];
                const originalZ = originalPositions.array[i3 + 2];

                // 영향력이 클수록 더 활발하게 움직임
                let movementFactor = 0.1 + influence * 0.9; // 0.1 ~ 1.0
                let speedFactor = 1.5 + influence * 1.0;    // 1.5 ~ 2.5

                // (추가) 별자리 모드일 때 움직임을 느리게 변경
                if (isConstellationMode) {
                    movementFactor = 0.05; // 움직임 거의 없게
                    speedFactor = 0.1;     // 매우 느린 속도
                }

                currentPositions[i3] = originalX + Math.sin(elapsedTime * speedFactor + originalY) * 0.5 * movementFactor;
                currentPositions[i3 + 1] = originalY + Math.cos(elapsedTime * speedFactor + originalX) * 0.5 * movementFactor;
                currentPositions[i3 + 2] = originalZ + Math.sin(elapsedTime * speedFactor + originalZ) * 0.5 * movementFactor;
            }
            particlesMaterial.needsUpdate = true;
            particleColors.needsUpdate = true;
            particlesGeometry.attributes.position.needsUpdate = true;

            // 마우스 움직임에 따라 카메라 시점 부드럽게 이동
            const targetX = mouse.x * 3;
            const targetY = mouse.y * 3;
            camera.position.x += (targetX - camera.position.x) * 0.02;
            camera.position.y += (targetY - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();

        // 창 크기 조절 대응
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    };

    initParticleField();

    // --- (추가) STATS 섹션 스킬 카드 호버 시 파티클 색상 변경 ---
    const skillCards = document.querySelectorAll('.skill-category');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const rect = card.getBoundingClientRect();
            
            // (수정) 카드의 중심점을 NDC(-1 ~ 1)로 변환하여 저장
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            hoveredCardCenter = new THREE.Vector2(
                (centerX / window.innerWidth) * 2 - 1,
                -(centerY / window.innerHeight) * 2 + 1
            );

            // (추가) 빛이 퍼져나갈 반경 설정 (카드 너비의 1.5배)
            glowRadius = (rect.width / window.innerWidth) * 1.5;
            
            // 카드의 하이라이트 색상 가져오기
            const colorString = getComputedStyle(card).getPropertyValue('--highlight-color').trim();
            hoverHighlightColor.set(colorString);
        });

        card.addEventListener('mouseleave', () => {
            hoveredCardCenter = null; // (수정) 중심점 정보 초기화
        });
    });

    // --- (수정) STATS 섹션 프로필 사진 드래그 이스터에그 ---
    const profileImageContainer = document.querySelector('.dynamic-profile');
    if (profileImageContainer) {
        let easterEggTimeout; // (추가) 이스터에그 자동 종료 타이머

        // 드래그 가능한 요소가 이미지 위로 들어왔을 때
        profileImageContainer.addEventListener('dragenter', (e) => {
            e.preventDefault();
            
            // 기존 타이머가 있다면 제거
            clearTimeout(easterEggTimeout);

            // 이스터에그 활성화
            const event = new CustomEvent('setEasterEgg', { detail: { enabled: true } }); 
            window.dispatchEvent(event);

            // 20초 후 자동으로 이스터에그 비활성화
            easterEggTimeout = setTimeout(() => {
                const event = new CustomEvent('setEasterEgg', { detail: { enabled: false } });
                window.dispatchEvent(event);
            }, 20000); // 20초
        });

        // 드래그 가능한 요소가 이미지 위에 머무를 때 (drop을 허용하기 위해 필요)
        profileImageContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // 드래그 가능한 요소가 이미지 밖으로 나가거나 드롭되었을 때
        profileImageContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            clearTimeout(easterEggTimeout); // 타이머 취소
        });
    }
    // (수정) 인트로 텍스트 애니메이션용 사운드 로직
    const introSound = document.getElementById('intro-dribble-sound');

    // (삭제) 기존 setTimeout 로직들은 startMainContentAnimations 함수로 이동

    // --- (추가) 타이핑 애니메이션 로직 ---
    function typeWriter(element, text, speed = 60) {
        let i = 0;
        element.innerHTML = ""; // 시작 전 내용 비우기
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    const typingElement = document.getElementById('typing-philosophy');
    if (typingElement) {
        typingElement.dataset.text = typingElement.textContent; // 원본 텍스트를 data 속성에 저장
        typingElement.innerHTML = ""; // JS 로드 시 텍스트 숨김 (깜빡임 방지)
        // (삭제) setTimeout 로직은 startMainContentAnimations 함수로 이동
    }

    // --- (추가) Web Audio API 사운드 제어 함수 ---
    // 소리 시작 함수 (낮은 음에서 시작)
    function startSound() {
        if (oscillator) oscillator.stop(); // 기존 소리 중지

        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'sine'; // 부드러운 사인파 (sine, square, sawtooth, triangle)
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); // 200Hz (낮은 음)에서 시작
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // 볼륨 (너무 크지 않게 0.15로 설정)

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
    }

    // 소리 중지 함수 (부드럽게 끄기)
    function stopSound() {
        if (gainNode && oscillator) {
            // 0.2초에 걸쳐 볼륨을 0으로 부드럽게 줄임
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
            // 0.2초 후에 오실레이터 완전 중지
            oscillator.stop(audioCtx.currentTime + 0.2);
            oscillator = null;
            gainNode = null;
        }
    }

    // 값을 주파수로 매핑하는 헬퍼 함수 (0~100 값을 200Hz~1000Hz로 변환)
    function mapValueToFrequency(value, maxValue, minFreq, maxFreq) {
        const ratio = value / maxValue;
        return minFreq + (maxFreq - minFreq) * ratio;
    }
    
    // (삭제) 타이핑용 IntersectionObserver 코드 삭제됨

    // --- (기존) 능력치 그래프 애니메이션 ---
    // (추가) 스탯 애니메이션을 실행하는 재사용 가능한 함수
    let isAnimating = false; // (추가) 애니메이션 중복 실행 방지 플래그

    function animateStats() {
        const statsSection = document.querySelector('#stats-section');
        // (수정) 애니메이션이 이미 실행 중이면 중복 호출 방지
        if (!statsSection || isAnimating) return;

        isAnimating = true; // 애니메이션 시작

        const skillWrappers = statsSection.querySelectorAll('.skill-bar-wrapper');

        // 1. 애니메이션 리셋: 바 높이와 숫자 초기화
        skillWrappers.forEach(wrapper => {
            const valueEl = wrapper.querySelector('.skill-value');
            const barEl = wrapper.querySelector('.bar');
            barEl.style.transition = 'none'; // 리셋 시에는 애니메이션 효과 제거
            barEl.style.height = '0%';
            valueEl.textContent = '0';
        });

        // 2. 애니메이션 재시작 (약간의 딜레이 후)
        setTimeout(() => {
            // (수정) 스탯 차트 애니메이션 시작 시 'stat_up.mp3' 사운드 재생
            playSound('stat-sound', 0.7);

            skillWrappers.forEach(wrapper => {
                const valueEl = wrapper.querySelector('.skill-value');
                const barEl = wrapper.querySelector('.bar');
                const skillValue = barEl.getAttribute('data-skill');

                barEl.style.transition = 'height 3.7s cubic-bezier(.23,1,.32,1), background-position 3.7s ease-out'; // 트랜지션 복원
                barEl.style.height = skillValue + '%'; // 막대 그래프 애니메이션
                barEl.style.backgroundPosition = '0 0'; // (추가) 쉬머 애니메이션 시작
                countUp(valueEl, skillValue, 1500); // (수정) 숫자는 빠르게 1.5초로 변경
            });
            setTimeout(() => { isAnimating = false; }, 3800); // 애니메이션 종료 후 플래그 리셋 (3.7s + 0.1s)
        }, 100); // 리셋이 반영될 시간을 줌
    }

    // (수정) 숫자 카운팅 애니메이션 함수에서 Web Audio API 관련 로직 제거
    const countUp = (el, end, duration = 2000) => {
        let start = 0;
        const target = parseInt(end, 10);
        if (isNaN(target)) return; // 숫자가 아닌 경우 중단
        const startTime = Date.now();

        const frame = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * (target - start) + start);
            
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                el.textContent = target;
            }
        };
        requestAnimationFrame(frame);    };

    // --- (수정) Works 섹션: Jumbotron 슬라이더 로직 ---
    const jumbotronScreen = document.getElementById('jumbotron-screen');
    const projectDataContainer = document.getElementById('project-data');
    const projectItems = projectDataContainer.querySelectorAll('.project-item');
    const jumbotronFooter = document.querySelector('.jumbotron-footer');
    const filmStripWrapper = document.querySelector('.film-strip-wrapper');
    const filmStrip = document.createElement('div'); // 슬라이드들을 담을 컨테이너
    filmStrip.className = 'film-strip';
    filmStripWrapper.appendChild(filmStrip);
    // 1. 프로젝트 데이터로부터 슬라이드 생성하는 함수
    const createSlides = (container) => {
    projectItems.forEach((item, index) => {
        // (수정) 카드 구조 변경 (썸네일 + 정보)
        const slide = document.createElement('div');
        slide.className = 'project-slide';
        slide.dataset.tags = item.dataset.tags || ''; // (추가) 필터링을 위한 태그 복사
        // (추가) 넓은 카드 클래스 추가
        if (item.dataset.size === 'wide') {
            slide.classList.add('wide');
        } else if (item.dataset.size === 'extra-wide') {
            // (추가) 더 넓은 카드 클래스 추가
            slide.classList.add('extra-wide');
        }

        const thumbnail = document.createElement('div');
        thumbnail.className = 'slide-thumbnail';
        const img = document.createElement('img');
        // (수정) 썸네일 이미지는 data-thumbnail 속성을 사용. 없으면 data-img를 사용.
        img.src = item.dataset.thumbnail || item.dataset.img;
        img.alt = item.dataset.title;
        thumbnail.appendChild(img);

        const content = document.createElement('div');
        content.className = 'slide-content';

        const category = document.createElement('p');
        category.className = 'project-category';
        category.textContent = item.dataset.category;

        let titleElement;
        // (추가) 이미지 제목(data-title-img)이 있으면 img 태그를, 없으면 h3 태그를 생성
        if (item.dataset.titleImg) {
            titleElement = document.createElement('img');
            titleElement.src = item.dataset.titleImg;
            titleElement.className = 'slide-title-img';
        } else {
            titleElement = document.createElement('h3');
            // (수정) data-title이 비어있지 않을 때만 텍스트 설정
            if (item.dataset.title) {
                titleElement.textContent = item.dataset.title;
            } else {
                titleElement = null; // 제목이 없으면 요소를 null로 처리
            }
        }

        content.appendChild(category);
        if (titleElement) { // 제목 요소가 존재할 때만 추가
            content.appendChild(titleElement);

            const viewButton = document.createElement('a');
            viewButton.href = '#';
            viewButton.className = 'view-button';
            viewButton.textContent = 'VIEW CASE';
            // 각 버튼에 모달을 열기 위한 데이터 속성 복사
            Object.keys(item.dataset).forEach(key => {
                viewButton.dataset[key] = item.dataset[key];
            });
            content.appendChild(viewButton);
        }

        slide.appendChild(content);
        slide.insertBefore(thumbnail, content); // 썸네일을 콘텐츠 앞에 추가
            container.appendChild(slide);
    });
    };

    // 2. 슬라이드 생성 및 무한 루프를 위해 복제
    if (projectItems.length > 0) {
        createSlides(filmStrip); // 원본 슬라이드 생성

        // 무한 루프를 위해 앞/뒤에 슬라이드 복제
        const originalSlides = filmStrip.querySelectorAll('.project-slide');
        const slidesToPrepend = Array.from(originalSlides).slice(-3).map(s => s.cloneNode(true));
        const slidesToAppend = Array.from(originalSlides).slice(0, 3).map(s => s.cloneNode(true));

        filmStrip.prepend(...slidesToPrepend);
        filmStrip.append(...slidesToAppend);
    }

    // --- (수정) 슬라이더 로직으로 변경 ---
    const prevBtn = document.getElementById('jumbotron-prev');
    const nextBtn = document.getElementById('jumbotron-next');
    // (수정) 자연스럽게 흐르는 애니메이션 로직으로 변경
    function setupScrollingAnimation() {
        const originalSlides = filmStrip.querySelectorAll('.project-slide');
        // (추가) 필터링을 위해 기존 복제본 제거
        filmStrip.querySelectorAll('[aria-hidden="true"]').forEach(clone => clone.remove());
        filmStrip.style.animation = 'none'; // 기존 애니메이션 중지

        if (originalSlides.length === 0) return;

        // 무한 스크롤을 위해 슬라이드 복제
        originalSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', true);
            filmStrip.appendChild(clone);
        });

        // 전체 너비 계산
        let totalWidth = 0;
        // (수정) 보이는 슬라이드만 너비 계산에 포함
        filmStrip.querySelectorAll('.project-slide:not([aria-hidden="true"])').forEach(slide => {
            totalWidth += slide.offsetWidth + parseInt(getComputedStyle(slide).marginRight) * 2;
        });

        // 애니메이션 속성 설정
        const duration = totalWidth / 100; // 100px당 1초의 속도로 설정
        // (수정) 애니메이션을 다시 시작하기 위해 속성 재설정
        requestAnimationFrame(() => {
            filmStrip.style.setProperty('--scroll-start', '0px');
            filmStrip.style.setProperty('--scroll-end', `-${totalWidth}px`);
            filmStrip.style.animation = `auto-scroll ${duration}s linear infinite`;
        });
    }

    // DOM 렌더링 후 애니메이션 설정
    setTimeout(setupScrollingAnimation, 100);

    // 마우스를 올리면 애니메이션 멈춤, 벗어나면 다시 시작
    jumbotronScreen.addEventListener('mouseenter', () => {
        filmStrip.style.animationPlayState = 'paused';
    });
    jumbotronScreen.addEventListener('mouseleave', () => {
        filmStrip.style.animationPlayState = 'running';
    });

    // 컨트롤러 버튼 숨기기 (자동 스크롤에서는 불필요)
    if(prevBtn) prevBtn.style.display = 'none';
    if(nextBtn) nextBtn.style.display = 'none';

    // --- (추가) 프로젝트 필터링 로직 ---
    const filtersContainer = document.querySelector('.project-filters');
    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.filter-btn');
            if (!filterBtn) return;
    
            // 활성 버튼 스타일 업데이트
            filtersContainer.querySelector('.active').classList.remove('active');
            filterBtn.classList.add('active');
    
            playSound('click-sound', 0.3);
    
            const filterValue = filterBtn.dataset.filter;
            const allSlides = filmStrip.querySelectorAll('.project-slide');
    
            // (수정) 슬라이더에 맞는 필터링 로직으로 변경 (FLIP 제거)
            allSlides.forEach(slide => {
                const slideTags = slide.dataset.tags;
                if (filterValue === 'all' || slideTags.includes(filterValue)) {
                    slide.classList.remove('is-filtered');
                    slide.style.display = ''; // 보이도록 설정
                } else {
                    slide.classList.add('is-filtered');
                    slide.style.display = 'none'; // 숨기기
                }
            });
            // (수정) 필터링 후 스크롤링 애니메이션 재설정
            setupScrollingAnimation();
        });
    }

    // --- (기존) 프로젝트 상세 정보 모달 로직 ---
    // (수정) viewButtons를 동적으로 생성된 버튼에 대해 이벤트 위임으로 처리
    const modalOverlay = document.getElementById('project-modal');
    const modalCloseBtn = document.querySelector('.modal-close');

    const modalImg = document.getElementById('modal-img');
    const modalPdf = document.getElementById('modal-pdf');
    const modalFigmaFrame = document.getElementById('modal-figma-frame');
    const modalFigmaIframe = document.getElementById('modal-figma-iframe');
    const modalImg2 = document.getElementById('modal-img2');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalRole = document.getElementById('modal-role');
    const modalTools = document.getElementById('modal-tools');

    // 이벤트 위임: #works-section 내부에서 .view-button 클릭 감지
    const worksSection = document.getElementById('works-section');
    worksSection.addEventListener('click', function(event) {
        const button = event.target.closest('.view-button');
        if (!button) return;

        event.preventDefault();

        const img = button.dataset.img;
        const img2 = button.dataset.img2;
        const figmaUrl = button.dataset.figmaUrl;
        const title = button.dataset.title;
        const category = button.dataset.category;
        const description = button.dataset.description;
        const role = button.dataset.role;
        const tools = button.dataset.tools;

        // (수정) PDF 파일인지 이미지 파일인지 확인하여 다르게 처리
        if (figmaUrl) {
            // 피그마 URL이 있으면 피그마 프레임 표시
            modalFigmaFrame.style.display = 'block';
            modalFigmaIframe.src = figmaUrl;
            modalPdf.style.display = 'none';
            modalImg.style.display = 'none';
            modalImg2.style.display = 'none';
        } else if (img && img.toLowerCase().endsWith('.pdf')) {
            // PDF 파일이면 PDF 뷰어 표시
            modalPdf.src = img;
            modalPdf.style.display = 'block';
            modalFigmaFrame.style.display = 'none';
            modalImg.style.display = 'none';
            modalImg2.style.display = 'none';
        } else {
            // 그 외에는 이미지 표시
            modalPdf.style.display = 'none';
            modalFigmaFrame.style.display = 'none';
            modalImg.src = img;
            modalImg.style.display = 'block';

            // (추가) 두 번째 이미지가 있는지 확인하고 표시/숨김 처리
            if (img2) {
                modalImg2.src = img2;
                modalImg2.style.display = 'block';
            } else {
                modalImg2.style.display = 'none';
            }
        }
        
        modalTitle.textContent = title;
        modalCategory.textContent = category;
        modalDescription.innerHTML = description;
        modalRole.textContent = role;
        modalTools.textContent = tools;
        
        playSound('open-modal-sound', 0.4);
        // (수정) display: flex를 먼저 적용하여 모달이 공간을 차지하도록 함
        modalOverlay.style.display = 'flex';
        modalOverlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    });

    function closeModal() {
        modalOverlay.classList.remove('is-visible');
        // (추가) transition이 끝난 후 display: none으로 설정하여 완전히 숨김
        modalOverlay.addEventListener('transitionend', function handler() {
            // is-visible 클래스가 없으면 (즉, 숨겨지는 중이면) display: none 처리
            if (!modalOverlay.classList.contains('is-visible')) {
                modalOverlay.style.display = 'none';
                modalOverlay.removeEventListener('transitionend', handler); // 이벤트 리스너 제거
            }
        });
        playSound('click-sound', 0.3); // (추가) 모달 닫기 사운드
        document.body.style.overflow = 'auto';
    }

    modalCloseBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalOverlay.classList.contains('is-visible')) {
            closeModal();
        }
    });

    // --- (추가) 부드러운 스크롤링 ---
    const navLinks = document.querySelectorAll('#main-header nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 기본 앵커 동작 방지

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // (수정) 모든 메뉴 클릭 시 동일한 클릭 사운드 재생
            playSound('click-sound', 0.3);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // (추가) STATS 메뉴 클릭 시 애니메이션 재실행
                if (targetId === '#stats-section') {
                    // (수정) 스크롤이 끝난 후 애니메이션을 실행하도록 단순화
                    // IntersectionObserver가 해제되었을 수 있으므로 직접 호출
                    setTimeout(animateStats, 500); // 스크롤 이동 시간을 고려하여 0.5초 후 실행
                }
            }
        });
    });

    // --- (수정) 스크롤 스파이 & 범용 스크롤 트리거 분리 ---

    // 1. 범용 스크롤 트리거 (콘텐츠 등장 애니메이션)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (soundEnabled && entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // STATS 섹션 애니메이션 트리거
                if (entry.target.classList.contains('stats-container') && !isAnimating) {
                    animateStats();
                }
                
                observer.unobserve(entry.target); // 애니메이션 실행 후 관찰 중지 (효율성)
            }
        });
    }, { rootMargin: '0px 0px -20% 0px' }); // 요소가 화면 하단에서 20% 올라왔을 때 실행

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. 스크롤 스파이 (메뉴 하이라이트)
    const sections = document.querySelectorAll('section[id], main#content');
    const navLinksObserver = document.querySelectorAll('#main-header nav a');
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navLinksObserver.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
                });
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -50% 0px', // 화면 중앙을 기준으로 메뉴 하이라이트
        threshold: 0
    });

    sections.forEach(section => spyObserver.observe(section));

    
    // --- (수정) 맨 위로 가기 버튼 로직 (3D 골대 버전) ---
    const backToTopHoop = document.getElementById('back-to-top-hoop');
    if(backToTopHoop) {
        window.addEventListener('scroll', () => {
            // 뷰포트 높이의 50% 이상 스크롤되면 버튼 표시
            if (window.scrollY > window.innerHeight * 0.5) {
                backToTopHoop.classList.add('is-visible');
            } else {
                backToTopHoop.classList.remove('is-visible');
            }
        });

        backToTopHoop.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 이미 애니메이션 중이면 중복 실행 방지
            if (backToTopHoop.classList.contains('is-swishing')) return;

            // (수정) 그물 흔들림(Swish) 애니메이션 실행
            backToTopHoop.classList.add('is-swishing');
            playSound('swish-sound', 0.7);

            // 애니메이션(0.5s)이 끝난 후 스크롤 실행
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // 스크롤 시작 후, 애니메이션 클래스 제거 (다음 클릭을 위해)
                setTimeout(() => backToTopHoop.classList.remove('is-swishing'), 500);
            }, 150); // 애니메이션 시작 후 스크롤까지의 딜레이
        });
    }

    // --- (수정) Contact 섹션: "The Winning Pass" 드래그 앤 드롭 로직 ---
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
        const signBtn = document.getElementById('sign-btn');
        const signatureArea = contactSection.querySelector('.signature-area');
        const dropZones = contactSection.querySelectorAll('.drop-zone');

        signBtn.addEventListener('click', () => {
            // 이미 서명했으면 중복 실행 방지
            if (contactSection.classList.contains('play-completed')) return;

            // 1. 상태 변경 및 버튼 비활성화
            contactSection.classList.add('play-completed');
            signBtn.disabled = true;
            signBtn.textContent = 'SIGNED!';

            // 2. 서명 애니메이션 ('샤샤샥')
            signatureArea.classList.add('is-signed');
            playSound('pen-scratch-sound', 0.6);
            
            // (수정) 제공된 순차적 애니메이션 로직 적용
            const paths = signatureArea.querySelectorAll('svg path');
            let delay = 0;
            paths.forEach(path => {
                const pathLength = path.getTotalLength();
                path.style.strokeDasharray = pathLength;
                path.style.strokeDashoffset = pathLength;
                // 애니메이션을 직접 설정
                path.style.animation = `draw-signature 1.5s ease-in-out forwards`;
                path.style.animationDelay = `${delay}s`;
                delay += 0.4; // 다음 경로는 0.4초 뒤에 시작
            });

            // 3. 스탬프 찍기 (서명 후 1초 뒤)
            setTimeout(() => {
                dropZones.forEach(zone => zone.classList.add('is-signed'));
            }, 1000);

            // 4. 최종 세리머니 (서명 후 1.5초 뒤)
            setTimeout(() => {
                // (수정) 카메라 플래시 효과를 안전하게 실행
                const cameraFlash = document.querySelector('.camera-flash');
                if (cameraFlash) {
                    cameraFlash.classList.add('flash');
                } else {
                    console.warn("경고: .camera-flash 요소를 찾을 수 없습니다.");
                }
                playSound('camera-flash-sound', 0.8);
                playSound('crowd-cheer-sound', 0.6);
                contactSection.querySelector('.signing-success').style.display = 'block'; // 성공 메시지 표시
            }, 1500);
        });

        // 아이콘 클릭 이벤트 (서명 후에도 작동하도록 수정)
        dropZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                if (zone.id === 'email-btn') {
                    e.preventDefault();
                    navigator.clipboard.writeText(zone.dataset.email);
                    alert('Email address copied to clipboard!');
                }
            });
        });
    }

    const customCursor = document.querySelector('.custom-cursor');
    if (customCursor) {
        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;
            customCursor.style.left = `${posX}px`;
            customCursor.style.top = `${posY}px`;
        });
    }

    const hoverableElements = document.querySelectorAll('a, button, .dynamic-profile');
    hoverableElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hovered');
            if (el.classList.contains('modal-close')) {
                playSound('click-sound', 0.2);
            }
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hovered');
        });
    });

    document.addEventListener('click', function(e) {
        if (e.target.closest('a, button')) return;
        if (customCursor) {
            if (customCursor.classList.contains('is-dribbling')) {
                customCursor.classList.remove('is-dribbling');
                void customCursor.offsetWidth;
            }
            customCursor.classList.add('is-dribbling');
            playSound('loader-dribble-video', 0.3);
            setTimeout(() => {
                if (customCursor) {
                    customCursor.classList.remove('is-dribbling');
                }
            }, 300);
        }
    });
});