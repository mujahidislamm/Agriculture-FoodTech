package com.example;

import java.util.Arrays;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Insets;
import java.util.ArrayList;
import java.util.List;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.table.DefaultTableModel;

/** Stores account and financial information for a farmer. */
public class Farmer {

    private static final List<Farmer> FARMERS = new ArrayList<>();

    private String username;
    private char[] password;
    private String cropType;
    private double lastYearsNetProfit;

    /** Creates a farmer account with the fields collected by the frontend. */
    public Farmer(String username, char[] password, String cropType) {
        this(username, password, cropType, 0.0);
    }

    /** Creates a farmer profile with account, crop, and profit information. */
    public Farmer(String username, char[] password, String cropType, double lastYearsNetProfit) {
        setUsername(username);
        setPassword(password);
        setCropType(cropType);
        setLastYearsNetProfit(lastYearsNetProfit);
    }

    /** Opens the farmer registration frontend. */
    public static void main(String[] args) {
        SwingUtilities.invokeLater(Farmer::showFrontend);
    }

    private static void showFrontend() {
        JFrame frame = new JFrame("Farmer Registry");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setMinimumSize(new Dimension(680, 520));
        frame.setSize(760, 580);
        frame.setLocationRelativeTo(null);

        Color background = new Color(245, 247, 242);
        Color green = new Color(35, 112, 71);
        JPanel root = new JPanel(new BorderLayout(18, 18));
        root.setBackground(background);
        root.setBorder(BorderFactory.createEmptyBorder(26, 30, 26, 30));

        JLabel heading = new JLabel("FARMER REGISTRY", SwingConstants.LEFT);
        heading.setFont(new Font("Segoe UI", Font.BOLD, 26));
        heading.setForeground(green);
        root.add(heading, BorderLayout.NORTH);

        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        JTextField usernameField = new JTextField();
        JPasswordField passwordField = new JPasswordField();
        JTextField cropField = new JTextField();
        addField(form, "Username", usernameField, 0);
        addField(form, "Password", passwordField, 1);
        addField(form, "Crop type", cropField, 2);

        DefaultTableModel model = new DefaultTableModel(new String[] {"Username", "Crop type"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        JTable table = new JTable(model);
        table.setRowHeight(30);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        table.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        table.setFont(new Font("Segoe UI", Font.PLAIN, 13));

        JButton saveButton = new JButton("Save farmer");
        saveButton.setBackground(green);
        saveButton.setForeground(Color.WHITE);
        saveButton.setFocusPainted(false);
        saveButton.addActionListener(event -> {
            try {
                char[] password = passwordField.getPassword();
                Farmer farmer = new Farmer(usernameField.getText(), password, cropField.getText());
                Arrays.fill(password, '\0');
                FARMERS.add(farmer);
                model.addRow(new Object[] {farmer.getUsername(), farmer.getCropType()});
                usernameField.setText("");
                passwordField.setText("");
                cropField.setText("");
                usernameField.requestFocusInWindow();
            } catch (IllegalArgumentException exception) {
                JOptionPane.showMessageDialog(frame, exception.getMessage(), "Check details",
                        JOptionPane.WARNING_MESSAGE);
            }
        });

        JButton deleteButton = new JButton("Delete selected");
        deleteButton.addActionListener(event -> {
            int selectedRow = table.getSelectedRow();
            if (selectedRow >= 0) {
                FARMERS.remove(selectedRow);
                model.removeRow(selectedRow);
            }
        });

        JPanel actions = new JPanel(new GridLayout(1, 2, 8, 8));
        actions.setOpaque(false);
        actions.add(saveButton);
        actions.add(deleteButton);
        JPanel formPanel = new JPanel(new BorderLayout(12, 12));
        formPanel.setOpaque(false);
        formPanel.add(form, BorderLayout.CENTER);
        formPanel.add(actions, BorderLayout.SOUTH);

        root.add(formPanel, BorderLayout.WEST);
        root.add(new JScrollPane(table), BorderLayout.CENTER);
        frame.setContentPane(root);
        frame.setVisible(true);
    }

    private static void addField(JPanel panel, String label, JTextField field, int row) {
        GridBagConstraints constraints = new GridBagConstraints();
        constraints.insets = new Insets(6, 0, 6, 12);
        constraints.anchor = GridBagConstraints.WEST;
        constraints.gridx = 0;
        constraints.gridy = row;
        panel.add(new JLabel(label), constraints);
        constraints.gridx = 1;
        constraints.weightx = 1;
        constraints.fill = GridBagConstraints.HORIZONTAL;
        panel.add(field, constraints);
    }

    /** Returns the farmer's username. */
    public String getUsername() {
        return username;
    }

    /** Updates the farmer's username. */
    public void setUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be blank");
        }
        this.username = username;
    }

    /** Returns a copy of the farmer's password. */
    public char[] getPassword() {
        return Arrays.copyOf(password, password.length);
    }

    /** Updates the farmer's password. */
    public void setPassword(char[] password) {
        if (password == null || password.length == 0) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        this.password = Arrays.copyOf(password, password.length);
    }

    /** Returns the type of crop the farmer grows. */
    public String getCropType() {
        return cropType;
    }

    /** Updates the type of crop the farmer grows. */
    public void setCropType(String cropType) {
        if (cropType == null || cropType.isBlank()) {
            throw new IllegalArgumentException("Crop type cannot be blank");
        }
        this.cropType = cropType;
    }

    /** Returns the farmer's net profit from last year. */
    public double getLastYearsNetProfit() {
        return lastYearsNetProfit;
    }

    /** Updates the farmer's net profit from last year. */
    public void setLastYearsNetProfit(double lastYearsNetProfit) {
        if (!Double.isFinite(lastYearsNetProfit)) {
            throw new IllegalArgumentException("Net profit must be a finite number");
        }
        this.lastYearsNetProfit = lastYearsNetProfit;
    }

    /** Clears the in-memory password characters. */
    public void clearPassword() {
        Arrays.fill(password, '\0');
    }
}
