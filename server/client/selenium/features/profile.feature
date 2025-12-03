Feature: User Profile Management
  As a logged in user
  I want to view and edit my profile
  So that I can keep my information updated

  Background:
    Given I create a new test account if it doesn't exist

  Scenario: View profile information
    Given I am on the home page for profile
    When I log in with valid credentials
    And I navigate to the profile page
    Then I should see my profile information displayed
    And the username field should be disabled
    And the email field should be disabled
    And the phone field should be disabled

  Scenario: Edit profile age
    Given I am logged in and on the profile page
    When I change the age to "25"
    And I click the save changes button
    Then I should see a success message
    And the age should be updated to "25"

  Scenario: Edit profile name
    Given I am logged in and on the profile page
    When I change the name to "Updated Name"
    And I click the save changes button
    Then I should see a success message
    And the name should be updated to "Updated Name"

  Scenario: Edit profile expediente
    Given I am logged in and on the profile page
    When I change the expediente to "999999"
    And I click the save changes button
    Then I should see a success message
    And the expediente should be updated to "999999"

  Scenario: Add and remove tags
    Given I am logged in and on the profile page
    When I click on the tag "#Cine"
    Then the tag should appear in selected tags
    When I click on the selected tag "#Cine"
    Then the tag should be removed from selected tags

  Scenario: Update tags and save
    Given I am logged in and on the profile page
    When I click on the tag "#Música"
    And I click on the tag "#Fitness"
    And I click the save changes button
    Then I should see a success message
    And the tags should be saved

  Scenario: Logout from profile
    Given I am logged in and on the profile page
    When I click the logout button
    Then I should be redirected to the home page
    And the token should be removed from local storage

  Scenario: Delete profile
    Given I am logged in and on the profile page
    When I click the delete profile button
    Then I should be redirected to the home page
    And the user account should be deleted