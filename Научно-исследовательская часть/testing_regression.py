import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error


def train_linear_regression(data, vars_dict):
    """
    Обучает модель линейной регрессии и оценивает ее на тестовой выборке.

    Параметры:
    data (pd.DataFrame): Датафрейм с данными.
    vars_dict (dict): Словарь с названиями колонок для признаков и целевой переменной.

    Возвращает:
    dict: Словарь с предсказаниями, MSE и R^2.
    """
    X = data[vars_dict['features_columns']]
    y = data[vars_dict['targets_columns']].values.ravel()
    min_index = np.argmin(y)
    split_idx = int((1 - 0.3) * len(X))
    X_left, y_left = X[:min_index], y[:min_index]
    X_train, X_test = X[min_index:split_idx], X[split_idx:]
    y_train, y_test = y[min_index:split_idx], y[split_idx:]

    model = LinearRegression()
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    # Визуализация
    plt.figure(figsize=(10, 6))
    plt.scatter(X_left, y_left, color='blue', alpha=0.75)
    plt.scatter(X_train, y_train, color='blue', label='Обучающая выборка', alpha=0.75)
    plt.scatter(X_test, y_test, color='green', label='Тестовая выборка', alpha=0.75)
    plt.scatter(X_test, predictions, color='red', label='Предсказания', alpha=0.75)
    plt.plot(X, model.predict(X), 'k--', lw=2, label='Модель')
    plt.xlabel('Признаки')
    plt.ylabel('Целевая переменная')
    plt.title('Сравнение обучающей и тестовой выборок с предсказаниями')
    plt.legend()
    plt.grid(True)
    plt.show()

    return {'predictions': predictions, 'MSE': mse, 'MAE': mae, 'R2': r2, 'y_test': y_test}


df = pd.read_csv('dataset.csv')
df = df[df['object'] == ('StoragePool001')]
print(df['time'])

df['time'] = pd.to_datetime(df['time'])
transformed_group = df.copy()
transformed_group['time'] = transformed_group['time'].apply(lambda x: x.timestamp())
vars_dict = {'features_columns': ['time'], 'targets_columns': ['Capacity usage(%)']}
results = train_linear_regression(transformed_group, vars_dict)

# Вывод результатов и построение графика
print("MAE: ", results['MAE'])
print("MSE:", results['MSE'])
print("R2:", results['R2'])

