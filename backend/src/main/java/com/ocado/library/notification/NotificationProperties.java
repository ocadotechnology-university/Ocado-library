package com.ocado.library.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications")
public class NotificationProperties {

    private Slack slack = new Slack();
    private LoanLimitsDays loanLimitsDays = new LoanLimitsDays();
    private String cron = "0 0 8 * * *";
    private int reminderCooldownDays = 7;
    private int pingCooldownHours = 24;

    public Slack getSlack() { return slack; }
    public void setSlack(Slack slack) { this.slack = slack; }
    public LoanLimitsDays getLoanLimitsDays() { return loanLimitsDays; }
    public void setLoanLimitsDays(LoanLimitsDays loanLimitsDays) { this.loanLimitsDays = loanLimitsDays; }
    public String getCron() { return cron; }
    public void setCron(String cron) { this.cron = cron; }
    public int getReminderCooldownDays() { return reminderCooldownDays; }
    public void setReminderCooldownDays(int reminderCooldownDays) { this.reminderCooldownDays = reminderCooldownDays; }
    public int getPingCooldownHours() { return pingCooldownHours; }
    public void setPingCooldownHours(int pingCooldownHours) { this.pingCooldownHours = pingCooldownHours; }

    public static class Slack {
        private boolean enabled;
        private String botToken = "";

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getBotToken() { return botToken; }
        public void setBotToken(String botToken) { this.botToken = botToken; }
    }

    public static class LoanLimitsDays {
        private int book = 120;
        private int boardGame = 240;

        public int getBook() { return book; }
        public void setBook(int book) { this.book = book; }
        public int getBoardGame() { return boardGame; }
        public void setBoardGame(int boardGame) { this.boardGame = boardGame; }
    }
}
