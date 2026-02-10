// About page functionality
document.addEventListener('DOMContentLoaded', function() {
    hidePreloader();
    
    // Simple animation for stats counter
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        const valueElement = item.querySelector('.stat-value');
        const targetValue = parseInt(valueElement.textContent);
        let currentValue = 0;
        const duration = 2000;
        const increment = targetValue / (duration / 16);
        
        const updateValue = () => {
            currentValue += increment;
            if (currentValue < targetValue) {
                valueElement.textContent = Math.ceil(currentValue);
                setTimeout(updateValue, 16);
            } else {
                valueElement.textContent = targetValue + (targetValue > 100 ? '+' : '');
            }
        };
        
        setTimeout(updateValue, 500);
    });
    
    // Add hover effect to team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', () => {
            const photo = member.querySelector('.member-photo');
            if (photo) {
                photo.style.transform = 'scale(1.05)';
            }
        });
        
        member.addEventListener('mouseleave', () => {
            const photo = member.querySelector('.member-photo');
            if (photo) {
                photo.style.transform = 'scale(1)';
            }
        });
    });
});
