# -*- coding: utf-8 -*-

"""
System Test example using Behavior-Driven Development (BDD) with Behave (Gherkin) and Selenium.
"""
from behave import given, then, when # pylint: disable=no-name-in-module
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchAttributeException

import time

from selenium import webdriver

@given("I am on the home page")  # pylint: disable=not-callable
def open_browser(context):
    """Opens in home page."""
    options = Options()

    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--headless")

    context.driver = webdriver.Chrome(options=options)
    context.driver.get("http://localhost:3000/client/views/home.html")

@when('I click tab "{query}" with link "{page}"')  # pylint: disable=not-callable
def click(context, query, page):
    """Clicks one tab."""
    tab = context.driver.find_element("css selector", f"a[href='{page}']")
    tab.click()

@then('I get to "{query}" and get redirected to home')  # pylint: disable=not-callable
def click(context,query):
    
    WebDriverWait(context.driver, 1).until(
        EC.url_contains("home.html")
    )


