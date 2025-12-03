from behave import given, when, then
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver

import os

import time
import random

@given("I am on the home page for matching")  # pylint: disable=not-callable
def open_browser(context):
    """Opens in home page."""
    options = Options()

    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_argument("--disable-blink-features=AutomationControlled")
    #options.add_argument("--headless")

    context.driver = webdriver.Chrome(options=options)
    context.driver.get("http://localhost:3000/client/views/home.html")

@when('I log in, and go to matches')  # pylint: disable=not-callable
def click(context):
    """Logs and goes to matches."""
    login_button = WebDriverWait(context.driver, 5).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".fa-solid"))
    )
    
    login_button.click()

    userlbl = WebDriverWait(context.driver, 5).until(
        EC.visibility_of_element_located((By.ID, "user1"))
    )
    
    context.driver.find_element(By.ID, "user1").send_keys("test")
    context.driver.find_element(By.ID, "password1").send_keys("12345")
    boton = WebDriverWait(context.driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    )
    boton.click()
    
    time.sleep(3)
    link = WebDriverWait(context.driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a.nav-link[href='swipe.html']"))
    )
    link.click()

    WebDriverWait(context.driver, 5).until(
        EC.url_contains("swipe.html")
    )


@then('the user for matching gets displayed')  # pylint: disable=not-callable
def click(context):
    
    WebDriverWait(context.driver, 5).until(
        EC.url_contains("swipe.html")
    )

@when('I click on the right side')  # pylint: disable=not-callable
def click(context):
    """Clicks one tab."""
    boton_der = WebDriverWait(context.driver, 10).until(
        EC.element_to_be_clickable((By.ID, "cardRightTrigger"))
    )
    boton_der.click()
    
    #context.driver.find_element(By.ID, "cardRightTrigger").click()

@then('the user matches')  # pylint: disable=not-callable
def click(context):
    """a"""
    element = WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".flex.justify-center.w-100.h-full"))
    )
    assert element is not None, "Element with classes 'flex justify-center w-100 h-full' not found"


@when('I click on the left side')  # pylint: disable=not-callable
def click(context):
    """Clicks one tab."""
    boton_izq = WebDriverWait(context.driver, 10).until(
        EC.element_to_be_clickable((By.ID, "cardLeftTrigger"))
    )
    boton_izq.click()

@then('the user gets rejetected and other may appear')  # pylint: disable=not-callable
def click(context):
    """a"""
    element = WebDriverWait(context.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".flex.justify-center.w-100.h-full"))
    )
    assert element is not None, "Element with classes 'flex justify-center w-100 h-full' not found"


