import SupabaseWaitlistService from './SupabaseWaitlistService';

class NotificationService {
  private subscribers: Set<string> = new Set();
  private notifications: Array<{
    id: string;
    email: string;
    message: string;
    timestamp: Date;
    type: 'welcome' | 'update' | 'launch' | 'reminder';
  }> = [];

  constructor() {
    this.loadSubscribers();
    // Remove automatic demo notifications setup in production
    if (import.meta.env.DEV) {
      this.setupPeriodicNotifications();
    }
  }

  private loadSubscribers() {
    const saved = localStorage.getItem('reflectme_waitlist_subscribers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.subscribers = new Set(parsed);
      } catch (error) {
        console.error('Error loading subscribers:', error);
      }
    }
  }

  private saveSubscribers() {
    localStorage.setItem('reflectme_waitlist_subscribers', JSON.stringify([...this.subscribers]));
  }

  addSubscriber(email: string) {
    this.subscribers.add(email);
    this.saveSubscribers();
    
    console.log(`🎉 New subscriber added: ${email}`);
    console.log(`📊 Total subscribers: ${this.subscribers.size}`);
    
    // Only show demo message in development
    if (import.meta.env.DEV) {
      console.log(`💡 DEMO MODE: In a real environment, a confirmation email would be sent to ${email}`);
    }
    
    // Send welcome notification (only in development for demo)
    if (import.meta.env.DEV) {
      this.scheduleNotification(email, 'welcome', 3000);
      this.scheduleNotification(email, 'update', 7 * 24 * 60 * 60 * 1000); // 1 week
      this.scheduleNotification(email, 'reminder', 30 * 24 * 60 * 60 * 1000); // 1 month
    }
  }

  private scheduleNotification(email: string, type: 'welcome' | 'update' | 'launch' | 'reminder', delay: number) {
    setTimeout(() => {
      this.sendNotification(email, type);
    }, delay);
  }

  private async sendNotification(email: string, type: 'welcome' | 'update' | 'launch' | 'reminder') {
    const messages = {
      welcome: {
        title: 'Welcome to ReflectMe Waitlist! 🎉',
        body: 'Thank you for joining! We\'ll keep you updated on our launch progress.',
      },
      update: {
        title: 'ReflectMe Development Update 🚀',
        body: 'Great progress this week! We\'re getting closer to launch. Check your email for details.',
      },
      launch: {
        title: 'ReflectMe is Live! 🎊',
        body: 'Your wait is over! ReflectMe is now available. Claim your 50% launch discount!',
      },
      reminder: {
        title: 'Still excited about ReflectMe? 💙',
        body: 'We haven\'t forgotten about you! Here\'s an update on our progress.',
      }
    };

    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      email,
      message: messages[type].body,
      timestamp: new Date(),
      type
    };

    this.notifications.push(notification);

    // Try to add notification to Supabase if subscriber exists
    try {
      const { data: subscriber } = await SupabaseWaitlistService.getSubscriberByEmail(email);
      if (subscriber?.id) {
        await SupabaseWaitlistService.addNotification({
          subscriber_id: subscriber.id,
          type,
          title: messages[type].title,
          message: messages[type].body,
          delivery_status: 'sent',
          metadata: { channel: 'browser' }
        });
      }
    } catch (error) {
      console.error('Error saving notification to Supabase:', error);
    }

    // Browser notification with proper error handling
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(messages[type].title, {
          body: messages[type].body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `reflectme-${type}`,
          requireInteraction: type === 'launch',
          actions: type === 'launch' ? [
            { action: 'claim', title: 'Claim Discount' },
            { action: 'later', title: 'Remind Later' }
          ] : []
        });
      }
    } catch (error) {
      console.error('Error creating browser notification:', error);
    }

    // Simulate email sending (only log in development)
    if (import.meta.env.DEV) {
      console.log(`📧 Email sent to ${email}: ${messages[type].title}`);
      console.log(`📄 Email content: ${messages[type].body}`);
    }
    
    // Save notification history
    this.saveNotificationHistory();
  }

  private saveNotificationHistory() {
    localStorage.setItem('reflectme_notifications', JSON.stringify(this.notifications));
  }

  getNotificationHistory(): Array<{
    id: string;
    email: string;
    message: string;
    timestamp: Date;
    type: 'welcome' | 'update' | 'launch' | 'reminder';
  }> {
    return this.notifications;
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  isSubscribed(email: string): boolean {
    return this.subscribers.has(email);
  }

  private setupPeriodicNotifications() {
    // Send weekly updates to all subscribers (demo only)
    setInterval(() => {
      if (this.subscribers.size > 0) {
        const randomSubscriber = [...this.subscribers][Math.floor(Math.random() * this.subscribers.size)];
        this.sendNotification(randomSubscriber, 'update');
      }
    }, 7 * 24 * 60 * 60 * 1000); // Weekly

    // Simulate launch notification after 5 minutes for demo
    setTimeout(() => {
      this.subscribers.forEach(email => {
        this.sendNotification(email, 'launch');
      });
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Request notification permission with proper error handling
  static async requestPermission(): Promise<NotificationPermission> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && typeof window.Notification.requestPermission === 'function') {
        const permission = await window.Notification.requestPermission();
        return permission;
      }
      return 'denied';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Unsubscribe method
  unsubscribe(email: string) {
    this.subscribers.delete(email);
    this.saveSubscribers();
    localStorage.removeItem('reflectme_waitlist_email');
    localStorage.removeItem('reflectme_waitlist_date');
  }

  // Simulate email reply system (development only)
  simulateEmailReply(email: string, replyContent: string) {
    if (!import.meta.env.DEV) return;
    
    const autoReplies = [
      "Thank you for your enthusiasm! We're working hard to make ReflectMe the best it can be. 💙",
      "Your feedback is valuable to us! We'll definitely consider this for our launch. 🚀",
      "We appreciate your patience! ReflectMe will be worth the wait. ✨",
      "Great question! We'll be sharing more details in our next update. 📧",
      "Thank you for being part of our community! Your support means everything. 🎉"
    ];

    const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
    
    // Simulate reply delay
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification('ReflectMe Team replied! 💬', {
            body: reply,
            icon: '/favicon.ico',
            tag: 'reflectme-reply'
          });
        }
      } catch (error) {
        console.error('Error creating reply notification:', error);
      }
      
      console.log(`📧 Auto-reply sent to ${email}: ${reply}`);
    }, 2000 + Math.random() * 3000); // 2-5 seconds delay
  }
}

export default new NotificationService(); 