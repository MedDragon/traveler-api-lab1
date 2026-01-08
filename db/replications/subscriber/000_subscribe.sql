-- Створюємо підписку на публікацію з головного сервера
CREATE SUBSCRIPTION my_subscription
    CONNECTION 'host=postgres port=5432 user=repuser password=reppassword dbname=travel_planner'
    PUBLICATION my_publication;