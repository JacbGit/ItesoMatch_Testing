Feature: Swipe right and left matches
  As a user
  I want to accept and reject matches
  and I want users to display

  Scenario: Scenario Outline name: Accepting and Rejecting matches
    Given I am on the home page for matching
    When I log in, and go to matches
    Then the user for matching gets displayed
    When I click on the right side
    Then the user matches
    When I click on the left side
    Then the user gets rejetected and other may appear