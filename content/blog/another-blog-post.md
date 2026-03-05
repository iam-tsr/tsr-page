## Introduction

K-Fold Cross-Validation is a robust statistical method used to estimate the skill of a machine learning model on unseen data. It helps mitigate problems like overfitting and provides a more reliable metric than a single train-test split.

<div style="width:100%; text-align: center;">
  <img src="../../assets/blog/sample.png" alt="Image from Scikit-learn" width=700/>
</div>

In K-Fold, the original dataset is randomly partitioned into k equal-sized subsamples (folds). The model is trained and tested k times:

- Split: The data is divided into folds {$F_1​,F_2​,…,F_k​$}.

- Iterate: In each iteration $i$, the $i$-th fold $(Fi​)$ serves as the validation set, while the remaining $k−1$ folds are combined to form the training set.

- Evaluate: A performance score $E_i​$ (like accuracy or Mean Squared Error) is calculated for each iteration.

The final performance estimate is the average of the values computed in the loop. If $E_i​$ is the error or score from the $i$-th fold, the total performance $E$ is the **arithmetic mean**:

$$E = \frac{1}{k} \sum_{i=1}^{k} E_i$$

To understand the stability of the model, we often calculate the standard deviation of these scores:

$$\sigma = \sqrt{\frac{1}{k} \sum_{i=1}^{k} (E_i - E)^2}$$

Key Considerations

- **Bias-Variance Trade-off:** A higher $k$ (e.g., $k=10$) reduces bias because the model is trained on almost the entire dataset, but it increases variance and computational cost.

- **Standard Practice:** $k=5$ or $k=10$ are the most common choices, as they generally provide a good balance between computational efficiency and reliable error estimation.