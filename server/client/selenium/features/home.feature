Feature: Home redirection test
  As a unlogged user
  I want to check the other pages
  but Im unlogged so it redirects me

  Scenario Outline: Scenario Outline name: Searching colleges on google
    Given I am on the home page
    When I click tab "<tab>" with link "<page>"
    Then I get to "<page>" and get redirected to home

    Examples:
        | tab      | page          |
        | Chat     | chat.html     |
        | Swipe    | swipe.html    |
        | Perfil   | profile.html  |