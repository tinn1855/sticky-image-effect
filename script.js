
class RollsRoyceScrollEffect {
    constructor(section) {
        this.section = section;
        this.scrollContainer = section.querySelector('.kl-scroll-container');
        this.stickyWrapper = section.querySelector('.kl-sticky-wrapper');
        this.image1 = section.querySelector('.kl-image-1');
        this.image2 = section.querySelector('.kl-image-2');
        this.textOverlay = section.querySelector('.kl-text-overlay');
        
        if (!this.scrollContainer || !this.image1 || !this.image2 || !this.textOverlay) {
            console.warn('Missing required elements');
            return;
        }

        this.timeline = {
         
            img1Start: 0,
            img1End: 0.30,
            img1StartSize: 60,
            img1EndSize: 100,
            
            img2Start: 0.30,
            img2End: 0.60,
        
            textStart: 0.60,
            textEnd: 0.80
        };

        this.cuklentValues = {
            img1Size: 60,
            img2Translate: 100,
            textOpacity: 0,
            textTranslate: 30
        };
        
        this.targetValues = { ...this.cuklentValues };
        this.lerping = false;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.calculateTargets();
            if (!this.lerping) {
                this.lerping = true;
                this.lerpLoop();
            }
        }, { passive: true });
        this.calculateTargets();
        this.applyValues();
    }

    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeOutQuad(t) {
        return 1 - Math.pow(1 - t, 2);
    }

    calculateTargets() {
        const rect = this.scrollContainer.getBoundingClientRect();
        const scrollContainerHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        const scrollTop = -rect.top;
        const scrollableDistance = scrollContainerHeight - viewportHeight;
        const progress = Math.max(0, Math.min(1, scrollTop / scrollableDistance));

        const { img1Start, img1End, img1StartSize, img1EndSize } = this.timeline;
        let img1Size = img1StartSize;
        if (progress >= img1Start && progress <= img1End) {
            const p = (progress - img1Start) / (img1End - img1Start);
            img1Size = img1StartSize + (img1EndSize - img1StartSize) * this.easeOutCubic(p);
        } else if (progress > img1End) {
            img1Size = img1EndSize;
        }
        this.targetValues.img1Size = img1Size;

        const { img2Start, img2End } = this.timeline;
        let img2Translate = 100;
        if (progress < img2Start) {
            img2Translate = 100;
        } else if (progress >= img2Start && progress <= img2End) {
            const p = (progress - img2Start) / (img2End - img2Start);
            img2Translate = 100 - (this.easeOutQuart(p) * 100);
        } else {
            img2Translate = 0;
        }
        this.targetValues.img2Translate = img2Translate;

        const { textStart, textEnd } = this.timeline;
        let textOpacity = 0;
        let textTranslate = 30;
        if (progress < textStart) {
            textOpacity = 0;
            textTranslate = 30;
        } else if (progress >= textStart && progress <= textEnd) {
            const p = (progress - textStart) / (textEnd - textStart);
            const eased = this.easeOutQuad(p);
            textOpacity = eased;
            textTranslate = 30 - (eased * 30);
        } else {
            textOpacity = 1;
            textTranslate = 0;
        }
        this.targetValues.textOpacity = textOpacity;
        this.targetValues.textTranslate = textTranslate;
    }

    lerpLoop() {
        const lerpFactor = 0.12; 
        
        this.cuklentValues.img1Size = this.lerp(
            this.cuklentValues.img1Size, 
            this.targetValues.img1Size, 
            lerpFactor
        );
        
        this.cuklentValues.img2Translate = this.lerp(
            this.cuklentValues.img2Translate, 
            this.targetValues.img2Translate, 
            lerpFactor
        );
        
        this.cuklentValues.textOpacity = this.lerp(
            this.cuklentValues.textOpacity, 
            this.targetValues.textOpacity, 
            lerpFactor * 1.5 
        );
        
        this.cuklentValues.textTranslate = this.lerp(
            this.cuklentValues.textTranslate, 
            this.targetValues.textTranslate, 
            lerpFactor * 1.5
        );

        this.applyValues();

        const threshold = 0.01;
        const needsUpdate = 
            Math.abs(this.cuklentValues.img1Size - this.targetValues.img1Size) > threshold ||
            Math.abs(this.cuklentValues.img2Translate - this.targetValues.img2Translate) > threshold ||
            Math.abs(this.cuklentValues.textOpacity - this.targetValues.textOpacity) > threshold;

        if (needsUpdate) {
            requestAnimationFrame(() => this.lerpLoop());
        } else {
            this.lerping = false;
            this.cuklentValues = { ...this.targetValues };
            this.applyValues();
        }
    }

    applyValues() {
        const { img1Size, img2Translate, textOpacity, textTranslate } = this.cuklentValues;
        
        this.image1.style.setProperty('--img1-width', `${img1Size}%`);
        this.image1.style.setProperty('--img1-height', `${img1Size}%`);
        this.image2.style.setProperty('--img2-translate', `${img2Translate}%`);
        this.textOverlay.style.setProperty('--text-opacity', textOpacity);
        this.textOverlay.style.setProperty('--text-translate', `${textTranslate}px`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.kl-section');
    sections.forEach(section => {
        new RollsRoyceScrollEffect(section);
    });
    document.body.classList.add('loaded');
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 100);
}, { passive: true });
