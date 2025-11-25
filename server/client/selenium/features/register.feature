Feature: Registration form test
  As a new user
  I want to register in the app
  So that I cannot navigate away until all required fields are filled

  Scenario: Complete registration step by step
    Given I am on the home page for register
    When I click on "Registrate"
    Then the registration modal should appear

    When I fill the username with "test"
    And I fill the edad with "21"
    And I fill the name with "test"
    And I fill the email with "test@mx.com"
    And I fill the expediente with "123456"
    And I fill the phone with "123456789"
    And I fill the password with "12345"
    And I upload the image "server/client/selenium/jueves.png"
    And I click the badges to select interests
    And I submit the registration form
    Then I should be registered successfully
