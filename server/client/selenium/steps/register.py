from behave import given, when, then
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver

import os

import time
import random

@given("I am on the home page for register")
def open_home(context):
    options = Options()
    options.add_argument("--window-size=1920,1080")
    #options.add_argument("--headless")
    context.driver = webdriver.Chrome(options=options)
    context.driver.get("http://localhost:3000/client/views/home.html")

@when('I click on "Registrate"')
def click_register(context):
    context.driver.find_element(By.CSS_SELECTOR, ".fa-solid").click()

    register_button = WebDriverWait(context.driver, 5).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Registrate"))
    )
    register_button.click()
    WebDriverWait(context.driver, 5).until(
        EC.visibility_of_element_located((By.ID, "RegisterForm"))
    )

@then("the registration modal should appear")
def check_modal(context):
    modal = context.driver.find_element(By.ID, "RegisterForm")
    assert modal.is_displayed(), "Registration modal is not visible"

@when('I fill the username with "{username}"')
def fill_username(context, username):
    input_el = context.driver.find_element(By.ID, "username")
    input_el.clear()
    input_el.send_keys(username + str(random.randint(0,9999)))
    badges_button = WebDriverWait(context.driver, 5).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".btn-block:nth-child(2)"))
    )
    context.badges_button = badges_button

@when('I fill the edad with "{edad}"')
def fill_edad(context, edad):
    input_el = context.driver.find_element(By.ID, "edad")
    input_el.clear()
    input_el.send_keys(edad)
    context.badges_button.click()#

@when('I fill the name with "{name}"')
def fill_name(context, name):
    input_el = context.driver.find_element(By.ID, "name")
    input_el.clear()
    input_el.send_keys(name)
    context.badges_button.click()#

@when('I fill the email with "{email}"')
def fill_email(context, email):
    input_el = context.driver.find_element(By.ID, "email")
    input_el.clear()
    input_el.send_keys(email + str(random.randint(0,9999)))
    context.badges_button.click()#

@when('I fill the expediente with "{expediente}"')
def fill_expediente(context, expediente):
    input_el = context.driver.find_element(By.ID, "expediente")
    input_el.clear()
    input_el.send_keys(expediente)
    context.badges_button.click()#

@when('I fill the phone with "{phone}"')
def fill_phone(context, phone):
    input_el = context.driver.find_element(By.ID, "phone")
    input_el.clear()
    input_el.send_keys(phone)
    context.badges_button.click()#

@when('I fill the password with "{password}"')
def fill_password(context, password):
    input_el = context.driver.find_element(By.ID, "password")
    input_el.clear()
    input_el.send_keys(password)
    context.badges_button.click()#

@when('I upload the image "{path}"')
def upload_image(context, path):
    
    # Ruta absoluta del archivo actual: .../selenium/features/steps/register.py
    steps_dir = os.path.dirname(os.path.abspath(__file__))

    # Ir 3 niveles arriba: steps → features → selenium → client → server → ProyectoWeb
    project_root = os.path.abspath(os.path.join(steps_dir, "../../../.."))

    # Combinar ProyectoWeb + ruta del feature
    absolute_path = os.path.join(project_root, path)

    print("ABS PATH:", absolute_path)

    context.driver.find_element(By.ID, "image").send_keys(absolute_path)
    context.badges_button.click()#

@when("I click the badges to select interests")
def click_badges(context):
    # Esperar a que la badge de Cine esté visible dentro del modal
    WebDriverWait(context.driver, 5).until(
        EC.visibility_of_element_located((By.ID, "tagsModal"))
    )

    context.driver.find_element(By.CSS_SELECTOR, ".badge:nth-child(1)").click()
    context.driver.find_element(By.CSS_SELECTOR, ".badge-primary:nth-child(1)").click()
    context.driver.find_element(By.CSS_SELECTOR, ".badge-primary:nth-child(1)").click()

@when("I submit the registration form")
def submit_form(context):
    context.driver.find_element(By.CSS_SELECTOR, ".modal-footer > .btn").click()

@then("I should be registered successfully")
def registration_success(context):
    WebDriverWait(context.driver, 1).until(
        EC.url_to_be("http://localhost:3000/client/views/profile.html")
    )
    context.driver.quit()