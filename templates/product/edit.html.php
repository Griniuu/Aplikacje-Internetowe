<?php
/** @var \App\Model\Product $product */
/** @var \App\Service\Router $router */

$title = "Edit Product {$product->getName()} ({$product->getId()})";
$bodyClass = "edit";

ob_start(); ?>
    <h1>Edit Product: <?= $product->getName(); ?></h1>

    <form action="<?= $router->generatePath('product-edit') ?>" method="post" class="edit-form">
        <?php require __DIR__ . DIRECTORY_SEPARATOR . '_form.html.php'; ?>
        <input type="hidden" name="action" value="product-edit">
        <input type="hidden" name="id" value="<?= $product->getId() ?>">
    </form>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('product-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('product-show', ['id' => $product->getId()]) ?>">View</a></li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
